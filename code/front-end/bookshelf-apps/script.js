const books = [];
const STORAGE_KEY = 'BOOKSHELF';
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return null;
}

function resetForm() {
    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputBookAuthor').value = '';
    document.getElementById('inputBookYear').value = '';
    document.getElementById('inputBookIsComplete').value = '';
    document.getElementById('searchBookTitle').value = '';
}

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const id = generateId();
    const bookObject = generateBookObject(id, title, author, year, isComplete);

    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function makeBookshelf(bookObject) {
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    const completeBookshelfList = document.getElementById('completeBookshelfList');

    incompleteBookshelfList.innerHTML = '';
    completeBookshelfList.innerHTML = '';

    for (let book of bookObject) {
        const id = book.id;
        const title = book.title;
        const author = book.author;
        const year = book.year;
        const isComplete = book.isComplete;

        let bookItem = document.createElement('article');
        bookItem.classList.add('book_item');
        bookItem.innerHTML = '<h3 name=' + id + '>' + title + '</h3>';
        bookItem.innerHTML += '<p>Author: ' + author + '</p>';
        bookItem.innerHTML += '<p>Year: ' + year + '</p>';

        let containerActionItem = document.createElement('div');
        containerActionItem.classList.add('action');

        const isDone = isComplete ? 'Mark as Incomplete' : 'Mark as Complete';
        const greenButton = document.createElement('button');
        greenButton.classList.add('green');
        greenButton.innerText = isDone;
        greenButton.addEventListener('click', function () {
            let text = 'Are you done reading this book?';
            if (confirm(text) === true) {
                changeStatus(id);
                resetForm();
            }
        });

        const redButton = document.createElement('button');
        redButton.classList.add('red');
        redButton.innerText = 'Delete';
        redButton.addEventListener('click', function () {
            let text = 'Are you sure want to delete this book?';
            if (confirm(text) === true) {
                deleteBook(id);
                resetForm();
            }
        });

        const orangeButton = document.createElement('button');
        orangeButton.classList.add('orange');
        orangeButton.innerText = 'Edit';
        orangeButton.addEventListener('click', function () {
            editBook(id);
        });

        containerActionItem.append(greenButton, redButton, orangeButton);
        bookItem.append(containerActionItem);

        if (isComplete === false) {
            incompleteBookshelfList.append(bookItem);
            continue;
        }

        completeBookshelfList.append(bookItem);
    }
}

function changeStatus(bookId) {
    const bookIndex = findBookIndex(bookId);

    if (bookIndex === null) {
        return;
    }

    for (const index in books) {
        if (index === bookIndex) {
            if (books[index].isComplete === true) {
                books[index].isComplete = false;
            } else {
                books[index].isComplete = true;
            }
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function editBook(bookId) {
    document.getElementById('edit').style.display = 'flex';
    const bookIndex = findBookIndex(bookId);

    if (bookIndex === null) {
        return;
    }

    const title = document.getElementById('editBookTitle');
    const author = document.getElementById('editBookAuthor');
    const year = document.getElementById('editBookYear');

    title.setAttribute('value', books[bookIndex].title);
    author.setAttribute('value', books[bookIndex].author);
    year.setAttribute('value', books[bookIndex].year);

    const saveButton = document.getElementById('saveEdit');
    const cancelButton = document.getElementById('cancelEdit');

    saveButton.addEventListener('click', function (event) {
        let text = 'Save changes?';
        if (confirm(text) === true) {
            books[bookIndex].title = title.value;
            books[bookIndex].author = author.value;
            books[bookIndex].year = year.value;

            document.getElementById('edit').style.display = 'none';
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();

            alert('Edit successful!');
            resetForm();
            event.preventDefault();
        } else {
            event.preventDefault();
        }
    });

    cancelButton.addEventListener('click', function (event) {
        document.getElementById('edit').style.display = 'none';
        event.preventDefault();
    });
}

function deleteBook(bookId) {
    const bookIndex = findBookIndex(bookId);

    if (bookIndex === null) {
        return;
    }

    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function searchBook(searchInputTitle) {
    const searchBookList = [];
    let bookIndex = 0;
    let found = false;

    for (let index = 0; index < books.length; index++) {
        if (books[index].title.toLowerCase().includes(searchInputTitle)) {
            bookIndex = index;
            found = true;
            const bookObject = generateBookObject(
                books[index].id,
                books[index].title,
                books[index].author,
                books[index].year,
                books[index].isComplete,
            )
            searchBookList.push(bookObject);
        }
    }

    if (found) {
        makeBookshelf(searchBookList);
    } else {
        const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
        const completeBookshelfList = document.getElementById('completeBookshelfList');
    
        incompleteBookshelfList.innerHTML = '';
        completeBookshelfList.innerHTML = '';
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        resetForm();
    });

    const searchSubmitForm = document.getElementById('searchBook');
    searchSubmitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchInput = document.getElementById('searchBookTitle').value.toLowerCase();
        searchBook(searchInput);
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, function () {
    makeBookshelf(books);
});

