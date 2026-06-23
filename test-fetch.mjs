const url = 'https://www.booking.com/hotel/fr/chateau-de-la-chevre-d-or.html';
const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
const text = await res.text();
console.log(res.status, text.length);
if (text.includes('bstatic.com')) {
  console.log('Success! bstatic found');
} else {
  console.log('Failed to find images');
}
