// import data from '../data/assets.json';

async function getData() {
  try {
    const response = await fetch(new URL('/data/central_dogma_assets.json', import.meta.url));
    const data = await response.text();
    return JSON.parse(data);
  } catch (err) {
    console.log('Something went wrong!', err);
  }
  return null;
}
export default { getData };
