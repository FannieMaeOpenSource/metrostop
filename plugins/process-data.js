import data from '../data/central_dogma_example_l2.csv';

async function getData({ Papa }) {
  try {
    return data;
  } catch (err) {
    console.log('Something went wrong!', err);
  }
  return null;
}
export default { getData };
