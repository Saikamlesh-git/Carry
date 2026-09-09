/**
 * Generate formatted WhatsApp order text and link
 */
export function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function generateWhatsAppMessage({ hotelName, items, totalAmount }) {
  let message = `CARRY ORDER\n`;
  message += `========================\n\n`;
  message += `HOTEL NAME:\n${hotelName}\n\n`;
  message += `ORDER DETAILS\n`;
  message += `------------------------\n\n`;

  items.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    message += `${index + 1}. ${item.product.name}\n`;
    message += `   Unit: ${item.product.unit_type}\n`;
    message += `   Quantity: ${item.quantity}\n`;
    message += `   Price: ${formatCurrency(item.product.price)}\n`;
    message += `   Total: ${formatCurrency(itemTotal)}\n\n`;
  });

  message += `------------------------\n\n`;
  message += `TOTAL AMOUNT: ${formatCurrency(totalAmount)}\n\n`;
  message += `Thank you for ordering with Carry.`;

  return message;
}

export function buildWhatsAppUrl(phoneNumber, messageText) {
  // Strip non-numeric characters
  let cleanNumber = (phoneNumber || '').replace(/\D/g, '');
  
  // Default to India country code 91 if 10-digit number is provided
  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }

  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}
