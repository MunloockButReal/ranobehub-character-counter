$(document).ready(function () {
	const userAgent = window.navigator.userAgent.toLowerCase();
	if (userAgent.indexOf('chrome') > -1 && !!window.chrome) {
		const link = $('<link>')
			.attr('rel', 'stylesheet')
			.attr('type', 'text/css')
			.attr('href', chrome.runtime.getURL('styles.css'));
		$('head').append(link);
	}

	let readingSpeed = 180; // User-customizable setting
	let bookmarkBackgroundColor;
	let bookmarkTextColor;

	// Checking if the current page is a chapter page
	let urlPatternChapter = /ranobehub.org\/ranobe\/\d+\/\d+\/\d+/;
	// Checking if the current page is a book page
	let urlPatternBookPage = /\/ranobehub.org\/ranobe\/\d+-\w+/;
	// Main logic based on URL patterns

	if (urlPatternChapter.test(window.location.href)) {
		initializeContentScript();
	}

	if (urlPatternBookPage.test(window.location.href)) {
		replaceTotalSymbols();
	}
	// Function to count characters in a text
	function countCharacters(text) {
		const charactersWithSpaces = text.length;
		const charactersWithoutSpaces = text.replace(/\s/g, '').length;
		const words = charactersWithSpaces !== 0 ? text.trim().split(/\s+/).length : 0;
		return {
			charactersWithSpaces,
			charactersWithoutSpaces,
			words,
		};
	}

	// Function to count images in a chapter
	function countImages(chapterElement) {
		const imageElements = chapterElement.find('img');
		return imageElements.length;
	}

	// Function to update chapter title with character count, image count, and word count
	function updateChapterTitle(chapterElement) {
		const chapterTitleElement = chapterElement.find('h1.ui.header');

		let chapterID;
		if (chapterTitleElement) chapterID = chapterTitleElement.attr('data-id');

		if (chapterTitleElement) {
			const chapterText = chapterTitleElement.text();
			const bookName = $('.b-breadcrumbs li a')[1].text.replaceAll('\n', '');
			const chapterAllP = chapterElement.find('p');
			const chapterContent = Array.from(chapterAllP)
				.map((p) => $(p).text())
				.join(' ');

			// Adding P bookmark
			if (chapterID) paragraphBookmarkFunction(chapterAllP, chapterID, chapterText, bookName);

			const { charactersWithSpaces, charactersWithoutSpaces, words } = countCharacters(chapterContent.trim());

			const readingSpeedValue = Math.round(words / readingSpeed).toString();
			const readingSpeedFormat =
				readingSpeedValue +
				(readingSpeedValue[readingSpeedValue.length - 1] == 1
					? ' минуту'
					: readingSpeedValue[readingSpeedValue.length - 1] == 2
					? ' минуты'
					: ' минут');
			const imagesCount = countImages(chapterElement);
			const countText = `Символов: ${charactersWithSpaces}, Символов без пробелов: ${charactersWithoutSpaces}, Слов: ${words}, Картинок: ${imagesCount}. 
		<br> Примерное время чтения: ${readingSpeedFormat} </br>`;
			chapterTitleElement.html(`${chapterText}<br><span style="font-size: 12px; color: #d4d4d4">${countText}</span>`);
		}
	}

	// Function to handle the mutation observer
	function handleMutations(mutationsList, observer) {
		mutationsList.forEach((mutation) => {
			const addedNodes = Array.from(mutation.addedNodes);
			addedNodes.forEach((addedNode) => {
				if (addedNode.nodeType === Node.ELEMENT_NODE) {
					const chapterElements = $(addedNode).find('.ui.text.container');
					chapterElements.each((index, chapterElement) => {
						updateChapterTitle($(chapterElement));
					});
				}
			});
		});
	}

	// Initialize the mutation observer for chapter elements
	function initializeContentScript() {
		const chapterElements = $('.ui.text.container');
		chapterElements.each((index, chapterElement) => {
			updateChapterTitle($(chapterElement));
		});

		const appContainer = $('#app');
		if (appContainer.length > 0) {
			const observer = new MutationObserver(handleMutations);
			observer.observe(appContainer[0], { childList: true, subtree: true });
		}
	}

	function replaceTotalSymbols() {
		let pcElement = $('.book-meta-value.book-stats');
		let pcChapterElement = pcElement.find('strong');
		let pcAuthorSheetsElement = pcElement.find('i.question.outline.circle.icon.__tooltip');
		let pcOriginalBookElement = pcElement.find('.book-stats__original');

		let mobileElement = $('#section-information');
		let mobileBookNotes = mobileElement.find('.book-notes').find('p');
		let mobileLinks = mobileElement.find('.ui.small.feed.ranobe-links');

		let chapters = pcChapterElement.text().trim();
		let authorSheetsData = pcAuthorSheetsElement.attr('data-tippy-content');
		let authorSheets = (authorSheetsData.match(/\d+/g) || [0])[1]; // Extracts the second number from the string or default to 0

		let totalSymbols = authorSheets * 40000;
		let totalSymbolsM = (totalSymbols / 1000000).toFixed(2);
		let averageSymbols = Math.floor(totalSymbols / chapters);

		pcElement
			.html(
				`<p><strong>${chapters}</strong> глав на русском</p>
		<p style="font-size: 12px; color: whitesmoke"><strong>${totalSymbolsM}M</strong> знаков, <strong>${authorSheets}</strong> авторских листов, (${averageSymbols} в среднем)</p>`
			)
			.append(pcOriginalBookElement);

		let mobileTranslated = $(
			`<p><strong>Переведено:</strong> ${chapters} глав; ${totalSymbolsM}M зн. ${authorSheets} а.л., (${averageSymbols} в среднем)</p>`
		);

		let mobileOriginal = mobileElement.find('p:contains("В оригинале")');
		let mLinks = $('<strong>Ссылки:</strong>').append(mobileLinks);

		mobileElement.empty().append(mobileBookNotes, mobileTranslated, mobileOriginal, mLinks);
	}

	function paragraphBookmarkFunction(chapterAllP, chapterID, chapterHeader, bookName) {
		let prevElement = null;
		let url = window.location.href.split('/').slice(-3);
		let bookID = url[0];
		let pBookmark = JSON.parse(localStorage.getItem('pBookmark')) || {};

		console.log(pBookmark);

		pBookmark = {
			[`${bookID} - ${bookName}`]: {
				[chapterHeader]: {
					'Full Path': url.join('/'),
					[chapterID]: {
						index: 0,
					},
				},
			},
		};
		pBookmark[`${bookID} - ${bookName}`][chapterHeader]['text'] =
			chapterAllP[pBookmark[`${bookID} - ${bookName}`][chapterHeader][chapterID].index].innerText;

		console.log(pBookmark);
		if (typeof pBookmark[bookID][chapterHeader][chapterID] == 'number') {
			p = chapterAllP[pBookmark[bookID][chapterHeader][chapterID]];
			$(p).addClass('paragraph-bookmark');
			prevElement = p;
		}

		chapterAllP.each((index, p) => {
			$(p).on('click', () => {
				console.log(p);
				pBookmark[bookID][chapterHeader][chapterID] = Array.from(chapterAllP).indexOf(p);

				if (prevElement !== null) {
					$(prevElement).removeClass('paragraph-bookmark');
				}
				$(p).addClass('paragraph-bookmark');

				if (prevElement !== null && prevElement == p) {
					$(prevElement).removeClass('paragraph-bookmark');
					prevElement = null;
					delete pBookmark[bookID][chapterHeader][chapterID];
				} else prevElement = p;

				localStorage.setItem('pBookmark', JSON.stringify(pBookmark));
			});
		});
	}
});

//
//
//

/* 
function apiText(chapterID) {
	let returnData = '';
	fetch(`https://ranobehub.org/api/chapter/${chapterID}`)
	.then((responce) => responce.json())
	.then((data) => {
		returnData = data.chapter.text.replace(new RegExp(`<.*?>`, 'g'), '');
	});
	return returnData;
}

console.log(apiText(30044));
 */

// browserName = (function (agent) {        switch (true) {
// 	case agent.indexOf("edge") > -1: return "MS Edge";
// 	case agent.indexOf("edg/") > -1: return "Edge ( chromium based)";
// 	case agent.indexOf("opr") > -1 && !!window.opr: return "Opera";
// 	case agent.indexOf("chrome") > -1 && !!window.chrome: return "Chrome";
// 	case agent.indexOf("trident") > -1: return "MS IE";
// 	case agent.indexOf("firefox") > -1: return "Mozilla Firefox";
// 	case agent.indexOf("safari") > -1: return "Safari";
// 	default: return "other";
// }
// })(window.navigator.userAgent.toLowerCase());

// console.log(browserName)
