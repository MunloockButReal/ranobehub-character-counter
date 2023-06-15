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
	const imageElements = chapterElement.querySelectorAll('img');
	return imageElements.length;
}

// Function to update chapter title with character count, image count, and word count
function updateChapterTitle(chapterElement) {
	const chapterTitleElement = chapterElement.querySelector('h1.ui.header');
	if (chapterTitleElement) {
		const chapterText = chapterTitleElement.innerText;
		const chapterContent = Array.from(chapterElement.querySelectorAll('p'))
			.map((p) => p.textContent)
			.join(' ');
		const { charactersWithSpaces, charactersWithoutSpaces, words } = countCharacters(chapterContent.trim());
		const imagesCount = countImages(chapterElement);
		const countText = `Символов: ${charactersWithSpaces}, Символов без пробелов: ${charactersWithoutSpaces}, Слов: ${words}, Картинок: ${imagesCount}`;
		chapterTitleElement.innerHTML = `${chapterText}<br><span style="font-size: 12px; color: #d4d4d4">${countText}</span>`;
	}
}

// Function to handle the mutation observer
function handleMutations(mutationsList, observer) {
	mutationsList.forEach((mutation) => {
		const addedNodes = Array.from(mutation.addedNodes);
		addedNodes.forEach((addedNode) => {
			if (addedNode.nodeType === Node.ELEMENT_NODE) {
				const chapterElements = Array.from(addedNode.querySelectorAll('.ui.text.container'));
				chapterElements.forEach((chapterElement) => updateChapterTitle(chapterElement));
			}
		});
	});
}

// Initialize the mutation observer for chapter elements
function initializeContentScript() {
	const chapterElements = Array.from(document.querySelectorAll('.ui.text.container'));
	chapterElements.forEach((chapterElement) => updateChapterTitle(chapterElement));

	const appContainer = document.getElementById('app');
	if (appContainer) {
		const observer = new MutationObserver(handleMutations);
		observer.observe(appContainer, { childList: true, subtree: true });
	}
}

function replaceTotalSymbols() {
	// PC segment
	let pcElement = $('.book-meta-value.book-stats');

	let pcChapterElement = pcElement.find('strong');
	let pcAuthorSheetsElement = pcElement.find('i.question.outline.circle.icon.__tooltip');
	let pcOriginalBookElement = pcElement.find('.book-stats__original');

	// Mobile segment
	let mobileElement = $('#section-information');
	let mobileBookNotes = mobileElement.find('.book-notes').find('p');
	let mobileLinks = mobileElement.find('.ui.small.feed.ranobe-links');

	mobileElement.find('.book-notes').empty();
	let mobileOriginal = mobileElement.find('p')[1];
	let mLinks = $(`<strong>Ссылки:</strong>`).append(mobileLinks);
	mobileElement.empty();

	// Extract the chapter and author's sheets information
	let chapters = pcChapterElement.text().trim();
	let authorSheetsData = pcAuthorSheetsElement.attr('data-tippy-content');
	let authorSheets = authorSheetsData.match(/\d+/g)[1] || 0; // Extracts all numbers from the string

	let totalSymbols = authorSheets * 40000;
	let totalSymbolsM = (totalSymbols / 1000000).toFixed(2);
	let averageSymbols = Math.floor(totalSymbols / chapters);

	pcElement.html(`<p><strong>${chapters}</strong> глав на русском</p>
	<p style="font-size: 12px; color: whitesmoke"><strong>${totalSymbolsM}M</strong> знаков, <strong>${authorSheets}</strong> авторских листов, (${averageSymbols} в среднем)</p>`);

	let mobileTranslated = `<p><strong>Переведено:</strong> ${chapters} глав; ${totalSymbolsM}M зн. ${authorSheets} а.л., (${averageSymbols} в среднем)</p>`;

	pcElement.append(pcOriginalBookElement);
	mobileElement.append(mobileBookNotes, mobileTranslated, mobileOriginal, mLinks);
}
// Checking if the current page is a chapter page
let urlPatternChapter = /ranobehub.org\/ranobe\/\d+\/\d+\/\d+/;

if (urlPatternChapter.test(window.location.href)) {
	initializeContentScript();
}

// Checking if the current page is a book page
let urlPatternBookPage = /\/ranobehub.org\/ranobe\/\d+-\w+/;

if (urlPatternBookPage.test(window.location.href)) {
	replaceTotalSymbols();
}

//
//
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
