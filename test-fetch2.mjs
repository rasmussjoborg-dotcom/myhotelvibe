const url = 'https://corsproxy.io/?' + encodeURIComponent('https://www.booking.com/hotel/fr/chateau-de-la-chevre-d-or.html');
const res = await fetch(url);
const text = await res.text();
console.log(res.status, text.length);
if (text.includes('bstatic.com')) {
  console.log('Success! bstatic found');
} else {
  console.log('Failed to find images');
}
