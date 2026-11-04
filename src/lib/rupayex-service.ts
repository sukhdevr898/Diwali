export interface RupayexCreateOrderResponse {
  ok: boolean;
  data?: {
    status?: boolean;
    order_id?: string;
    payment_url?: string;
    qr_url?: string;
    qr_data?: string;
    amount?: number;
    message?: string;
    raw?: string;
    [key: string]: unknown;
  };
  error?: string;
}

export interface RupayexStatusResponse {
  ok: boolean;
  data?: {
    status?: boolean;
    order_id?: string;
    amount?: number;
    payment_status?: 'SUCCESS' | 'FAILED' | 'PENDING';
    utr?: string;
    method?: string;
    raw?: string;
    [key: string]: unknown;
  };
  error?: string;
}

export async function initiateRupayexOrder(params: {
  amount: number;
  orderId: string;
  customerMobile?: string;
  remark1?: string;
}): Promise<RupayexCreateOrderResponse> {
  const redirectUrl = `${window.location.origin}?order_id=${params.orderId}&gateway=rupayex`;

  const res = await fetch('/api/rupayex/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount,
      order_id: params.orderId,
      redirect_url: redirectUrl,
      customer_mobile: params.customerMobile || '',
      remark1: params.remark1 || `Diwali Lottery Tickets #${params.orderId}`,
    }),
  });

  return await res.json();
}

export async function queryRupayexOrderStatus(orderId: string): Promise<RupayexStatusResponse> {
  const res = await fetch(`/api/rupayex/order-status/${encodeURIComponent(orderId)}`);
  return await res.json();
}
