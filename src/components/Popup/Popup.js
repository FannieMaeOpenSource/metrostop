import { select } from 'd3-selection';
import PopupDataStore from './PopupDataStore.js';

const d3 = { select };
/* This function appends a new popup element to a specified container
  Params: @popupContainer: container holding elements
          @message: text displayed in the popup
          @icon: class of FontAwesome icon to display in popup
          @error: true/false to stylize popup as error
*/
function AppendPopupDiv(popupContainer, message, icon, type) {
  const popup = popupContainer.append('div').attr('id', 'popup');
  const popupClose = popup.append('div').attr('id', 'popup-close');
  if (icon !== '') {
    popup.append('i').attr('class', icon).attr('id', 'popup-icon');
  }
  if (type === 'error') {
    popup
      .append('i')
      .attr('class', 'fas fa-exclamation-circle')
      .attr('id', 'popup-icon')
      .style('color', '#be3637');
  } else if (type == 'warning') {
    popup
      .append('i')
      .attr('class', 'fas fa-exclamation-triangle')
      .attr('id', 'popup-icon')
      .style('color', '#c76900');
  }
  popupClose.append('p').text('X');
  popupClose.on('click', () => {
    popupClose.node().parentNode.remove();
    PopupDataStore.modifyDataByMessage(message, 'show', false);
  });
  const popupText = popup.append('p');
  popupText.text(message);
  if (type === 'error') {
    popup.style('background-color', '#ffcfcf');
    popupText.style('color', '#be3637');
  } else if (type == 'warning') {
    popup.style('background-color', '#ffc788');
    popupText.style('color', '#c76900');
  }
  return popup;
}

/* This function adds a container to hold the popups
  Params: @container: outer container to hold new popup container
*/
function AppendPopupContainer(container) {
  const popupContainer = container.append('div').attr('id', 'popup-container');
  return popupContainer;
}

/* This function changes right attribute of the popup container, shifting it as needed when
    zoomed in to metrostop
*/
function ZoomInPopupContainer() {
  const popupContainer = d3.select('#popup-container');
  popupContainer.transition().duration(500).style('right', '26%');
}
// This function changes right attribute of the popup container, shifting it as needed when
// zoomed out to metrostop
function ZoomOutPopupContainer() {
  const popupContainer = d3.select('#popup-container');
  popupContainer.transition().duration(500).style('right', '20px');
}

/*  This function creates a new popup div and adds to the list of popups (as necessary)
  Params: @message: text displayed in the popup
          @summary: text displayed in the notification container
          @icon: class of FontAwesome icon to display in popup
          @error: true/false to stylize popup as error
*/
function AppendPopup(message, summary, icon, type) {
  if (PopupDataStore.checkIfStoredPopup(message)) {
    PopupDataStore.addData({
      id: PopupDataStore.getData().length,
      message,
      summary,
      icon,
      type,
      show: true,
    });
  }
  const popup = AppendPopupDiv(d3.select('#popup-container'), message, icon, type);
  setTimeout(() => {
    popup.style('opacity', 0);
    // Second timeout to await transition of popups
    setTimeout(() => {
      popup.remove();
      PopupDataStore.modifyDataByMessage(message, 'show', false);
    }, 1000);
  }, 30000);
}

/*  This function adds a notification icon to show all popups
    this function also sets the icon to show the summary of all popups
    on click
*/
function AppendPopupNotificationIcon(container) {
  const notificationIcon = container
    .append('i')
    .attr('class', 'fas fa-bell')
    .attr('id', 'notification-icon');
  notificationIcon.on('click', () => {
    const navBarIconsContainer = d3.select('#nav-bar-icons-container');
    if (navBarIconsContainer.node().childNodes.length === 2) {
      ShowAllPopups(container);
    } else {
      d3.select('#popup-summary-container').remove();
    }
  });
}

/*  Given a container, this function will show a list of a summary of all popups
    that the user has recieved, the user is able to click on each popup
    to show more information about it.
*/
function ShowAllPopups(container) {
  const popupNotificationContainer = container.append('div').attr('id', 'popup-summary-container');
  popupNotificationContainer.append('h2').text('Notifications');
  const closeBtn = popupNotificationContainer
    .append('div')
    .attr('id', 'popup-summary-container-close');
  closeBtn.append('p').text('X');
  closeBtn.on('click', () => {
    d3.select('#popup-summary-container').remove();
  });
  PopupDataStore.getData().forEach((popup) => {
    const popupSummary = popupNotificationContainer.append('div').attr('id', 'popup-summary');
    const moreButton = popupSummary.append('div').attr('id', 'popup-more-btn');
    moreButton.append('p').text('+');
    moreButton.on('click', () => {
      if (!popup.show) {
        AppendPopup(popup.message, popup.summary, popup.icon, popup.type);
        PopupDataStore.modifyDataByMessage(popup.message, 'show', true);
      }
    });
    popupSummary.append('p').text(popup.summary);
  });
}
export {
  AppendPopup,
  AppendPopupContainer,
  ZoomInPopupContainer,
  ZoomOutPopupContainer,
  AppendPopupNotificationIcon,
};
