let select = document.getElementById('limit');
let searchInput = document.getElementById('search');

const page = Number(document.getElementById('pageVal').innerHTML);
const limit = Number(document.getElementById('limitVal').innerHTML);
const search = document.getElementById('searchVal').innerHTML;

document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let append = '';

    if (limit != 30) {
        if (append) {
            append += '&';
        }
        append += 'l=' + limit;
    }

    if (searchInput.value) {
        if (append) {
            append += '&';
        }
        append += 'q=' + searchInput.value;
    }

    if (append) {
        append = '?' + append;
    }
    window.location.href = window.location.origin + '/singles' + append;
    select;
});

select.addEventListener('change', () => {
    let append = '';

    if (page > 1) {
        append += 'p=' + page;
    }

    let newLimit = select.value;

    if (newLimit != 30) {
        if (append) {
            append += '&';
        }
        append += 'l=' + newLimit;
    }

    if (search) {
        if (append) {
            append += '&';
        }
        append += 'q=' + searchInput.value;
    }

    if (append) {
        append = '?' + append;
    }
    window.location.href = window.location.origin + '/singles' + append;
});

document.getElementById('next-button').addEventListener('click', () => {
    let append = 'p=' + (page + 1);

    if (limit != 30) {
        if (append) {
            append += '&';
        }
        append += 'l=' + limit;
    }

    if (search) {
        if (append) {
            append += '&';
        }
        append += 'q=' + searchInput.value;
    }

    if (append) {
        append = '?' + append;
    }
    window.location.href = window.location.origin + '/singles' + append;
});

document.getElementById('prev-button').addEventListener('click', () => {
    let append = '';
    if (page > 2) {
        append = 'p=' + (page - 1);
    }

    if (limit != 30) {
        if (append) {
            append += '&';
        }
        append += 'l=' + limit;
    }

    if (search) {
        if (append) {
            append += '&';
        }
        append += 'q=' + searchInput.value;
    }

    if (append) {
        append = '?' + append;
    }
    window.location.href = window.location.origin + '/singles' + append;
});

function prevPage() {
    let append = '';
    if (page > 2) {
        append = 'p=' + (page - 1);
    }

    if (limit != 30) {
        if (append) {
            append += '&';
        }
        append += 'l=' + limit;
    }

    if (search) {
        if (append) {
            append += '&';
        }
        append += 'q=' + searchInput.value;
    }

    if (append) {
        append = '?' + append;
    }
    window.location.href = window.location.origin + '/singles' + append;
}
