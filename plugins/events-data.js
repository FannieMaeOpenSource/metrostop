import data from '../data/events.csv';

async function getData({ Papa }) {
  try {
    return data;
  } catch (err) {
    console.log('Something went wrong!', err);
  }
  return null;
}
export default { getData };
