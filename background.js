/* 
  Copyright 2020. Jefferson "jscher2000" Scher. License: MPL-2.0.
  version 0.1 - initial concept
  version 0.2 - added icons
  version 0.3 - updated icons
  version 0.4 - open new tab next to current page
  version 0.5 - handle multi-argument mailto links
*/

const baseUrl = 'https://mrd.mail.yahoo.com/compose/?';

/**** Context menu item ****/

let linkcontext = browser.menus.create({
  id: "yahoomail_mailtolink",
  title: "New Yahoo Mail message",
  contexts: ["link"],
  icons: {
	"16": "icons/Ymail-16.png",
	"32": "icons/Ymail-32.png"
  }
});

let pagecontext = browser.menus.create({
  id: "yahoomail_page",
  title: "New Yahoo Mail message (page title, URL)",
  contexts: ["page"],
  icons: {
	"16": "icons/Ymail-16.png",
	"32": "icons/Ymail-32.png"
  }
});

let selcontext = browser.menus.create({
  id: "yahoomail_selection",
  title: "New Yahoo Mail message (with selected text)",
  contexts: ["selection"],
  icons: {
	"16": "icons/Ymail-16.png",
	"32": "icons/Ymail-32.png"
  }
});

browser.menus.onClicked.addListener((menuInfo, currTab) => {
	var YUrl = '';
	switch (menuInfo.menuItemId) {
		case 'yahoomail_mailtolink':
			// Check the link protocol
			var linkSplit = menuInfo.linkUrl.split(':');
			if (linkSplit[0].toLowerCase() === 'mailto'){ // this is a mailto link
				linkSplit = linkSplit[1].split('?');
				YUrl = baseUrl + 'to=' + encodeURIComponent(linkSplit[0]);
				// handle additional mailto parameters (0.5)
				if (linkSplit.length > 1){
					for (var i=1; i<linkSplit.length; i++){
						var argSplit = linkSplit[i].split('&');
						for (var j=0; j<argSplit.length; j++){
							var param = argSplit[j].split('=');
							switch (param[0].toLowerCase()) {
								case 'cc':
									YUrl += '&cc=' + encodeURIComponent(param[1]);
									break;
								case 'bcc':
									YUrl += '&bcc=' + encodeURIComponent(param[1]);
									break;
								case 'subject':
									YUrl += '&subject=' + encodeURIComponent(param[1]);
									break;
								case 'body':
									YUrl += '&body=' + encodeURIComponent(param[1]);
									break;
								default:
									// ignore other parameters for now
							}
						}
					}
				}
			} else {	// this is not a mailto link
				// Share link
				console.log('What do to with this: '+menuInfo.linkUrl+'; text:'+menuInfo.linkText);
				YUrl = baseUrl + 'subject=Sharing%20a%20link' + '&body=Link:%20' + encodeURIComponent(menuInfo.linkUrl) + 
						' \n\n(From) ' + encodeURIComponent(currTab.url);
			}
			break;
		case 'yahoomail_page':
			// this is Email Link for the page
			YUrl = baseUrl + 'subject=' + encodeURIComponent(currTab.title) + '&body=Link:%20' + encodeURIComponent(currTab.url);
			break;
		case 'yahoomail_selection':
			YUrl = baseUrl;
			// This could be selected on a link... Try to find an address
			if (menuInfo.linkUrl){
				var linkSplit = menuInfo.linkUrl.split(':');
				if (linkSplit[0].toLowerCase() === 'mailto'){ // this is a mailto link
					linkSplit = linkSplit[1].split('?');
					YUrl = baseUrl + 'to=' + encodeURIComponent(linkSplit[0]);
					// do not add mailto parameters because are going to get those from the page
					YUrl += '&';
				}
			}
			// this is Email Link for the page when text is selected
			var seltext = menuInfo.selectionText;
			seltext = seltext.replace(/^\s*$/,'').replace(/\r/g,'\r').replace(/\n/g,'\n').replace(/^\s+|\s+$/g,' ');
			seltext = ' \n\n(Selection) ' + seltext.replace(new RegExp(/\u2019/g),'\'').replace(new RegExp(/\u201A/g),',').replace(new RegExp(/\u201B/g),'\'');
			YUrl += 'subject=' + encodeURIComponent(currTab.title) + '&body=Link:%20' + encodeURIComponent(currTab.url) +
					encodeURIComponent(seltext);
			break;
		default:
			// WTF?
	}
	if (YUrl.length > 0){
		browser.tabs.create({
			url: YUrl,
			index: currTab.index + 1,
			active: true
		}).then((newTab) => {
			/* No action */;
		}).catch((err) => {
			console.log('Error in tabs.create with "' + YUrl + '": ' + err.message);
		});
	}
});
