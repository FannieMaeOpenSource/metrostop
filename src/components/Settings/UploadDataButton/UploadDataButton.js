import { select } from 'd3-selection';
import * as Papa from 'papaparse';
import AppendButton from '../../Button/Button.js';

const d3 = { select };

/* Method to prompt user for csv file and convert csv to arrays */
function UploadFileBttnClicked(HandleDataUpload) {
  const input = document.createElement('input');
  input.type = 'file';
  const reader = new FileReader();

  reader.onload = (e) => {
    const text = e.target.result;
    const data = Papa.parse(text, { header: true });
    HandleDataUpload(data.data);
  };
  input.onchange = () => {
    const files = Array.from(input.files);
    reader.readAsText(files[0]);
  };
  input.click();
}

/* Method to draw upload button with handlers */
function CreateUploadButton(buttonContainer, bttnTextId, HandleDataUpload) {
  const text = 'Choose File';
  const uploadButton = AppendButton(bttnTextId, buttonContainer, text);
  uploadButton
    .on('mouseover', () => d3.select(`#${bttnTextId}`).style('color', 'white'))
    .on('mouseout', () => d3.select(`#${bttnTextId}`).style('color', '#05314D'))
    .on('click', () => {
      UploadFileBttnClicked(HandleDataUpload);
    });
}

export default CreateUploadButton;
