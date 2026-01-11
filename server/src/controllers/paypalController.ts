import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

// Note: Pour la production, utiliser @paypal/paypal-server-sdk
// Ceci est une implémentation simplifiée pour le développement

const PAYPAL_API = process.env.PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

export const createPayPalOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Commande non trouvée' });
      return;
    }

    if (order.userId !== req.user!.id) {
      res.status(403).json({ error: 'Accès non autorisé' });
      return;
    }

    if (order.status !== 'PENDING') {
      res.status(400).json({ error: 'Cette commande a déjà été payée' });
      return;
    }

    const accessToken = await getPayPalAccessToken();

    const paypalOrder = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: order.id,
        description: `Commande SoundAndSafe ${order.orderNumber}`,
        amount: {
          currency_code: 'EUR',
          value: order.total.toString(),
          breakdown: {
            item_total: {
              currency_code: 'EUR',
              value: order.subtotal.toString(),
            },
            shipping: {
              currency_code: 'EUR',
              value: order.shipping.toString(),
            },
          },
        },
        items: order.items.map((item) => ({
          name: item.nameFr,
          quantity: item.quantity.toString(),
          unit_amount: {
            currency_code: 'EUR',
            value: item.price.toString(),
          },
        })),
      }],
      application_context: {
        brand_name: 'SoundAndSafe',
        locale: 'fr-FR',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.CLIENT_URL}/checkout/success`,
        cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
      },
    };

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paypalOrder),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur PayPal:', data);
      res.status(500).json({ error: 'Erreur lors de la création de la commande PayPal' });
      return;
    }

    // Sauvegarder l'ID PayPal
    await prisma.order.update({
      where: { id: orderId },
      data: { paypalOrderId: data.id },
    });

    res.json({
      paypalOrderId: data.id,
      approvalUrl: data.links.find((link: any) => link.rel === 'approve')?.href,
    });
  } catch (error) {
    console.error('Erreur lors de la création de la commande PayPal:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande PayPal' });
  }
};

export const capturePayPalOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { paypalOrderId } = req.body;

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'COMPLETED') {
      console.error('Erreur capture PayPal:', data);
      res.status(500).json({ error: 'Erreur lors de la capture du paiement' });
      return;
    }

    // Mettre à jour la commande
    const order = await prisma.order.update({
      where: { paypalOrderId },
      data: { status: 'PAID' },
      include: {
        items: true,
        user: { select: { email: true, firstName: true } },
      },
    });

    res.json({
      success: true,
      order,
      paypalDetails: {
        id: data.id,
        status: data.status,
        payer: data.payer,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la capture du paiement:', error);
    res.status(500).json({ error: 'Erreur lors de la capture du paiement' });
  }
};

export const getPayPalClientId = (_req: Request, res: Response) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
};
