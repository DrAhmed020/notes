import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDEWffPfy-fljp32H8AjemraCau-f9JN-M",
    authDomain: "student-notes-app-3d196.firebaseapp.com",
    projectId: "student-notes-app-3d196",
    storageBucket: "student-notes-app-3d196.appspot.com",
    messagingSenderId: "99837564904",
    appId: "1:99837564904:web:6b880e2b80e439c8fcf65d",
    measurementId: "G-N63JWQNTZF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const notesContainer = document.getElementById('notesContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let allNotes = [];
let currentPage = 1;
const notesPerPage = 9; // عرض 9 ملاحظات في كل صفحة (3 في كل صف)

let lastVisible = null; // آخر عنصر للصفحة الحالية (للتصفح للأمام)
let firstVisible = null; // أول عنصر للصفحة الحالية (للتصفح للخلف)

// تحميل الملاحظات من Firestore
async function loadNotes(direction = null) {
    notesContainer.innerHTML = "جارٍ التحميل...";

    let notesQuery;
    const notesRef = collection(db, "notes");

    if (direction === "next" && lastVisible) {
        // التصفح للأمام
        notesQuery = query(notesRef, orderBy("timestamp", "desc"), startAfter(lastVisible), limit(notesPerPage));
    } else if (direction === "prev" && firstVisible) {
        // التصفح للخلف
        notesQuery = query(notesRef, orderBy("timestamp", "desc"), endBefore(firstVisible), limit(notesPerPage));
    } else {
        // الصفحة الأولى
        notesQuery = query(notesRef, orderBy("timestamp", "desc"), limit(notesPerPage));
    }

    const querySnapshot = await getDocs(notesQuery);

    if (!querySnapshot.empty) {
        // تحديث مؤشرات الصفحة
        firstVisible = querySnapshot.docs[0];
        lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        // تخزين الملاحظات لعرضها
        allNotes = querySnapshot.docs.map(doc => doc.data());
        displayNotes();
    } else {
        notesContainer.innerHTML = "لا توجد ملاحظات للعرض.";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }
}

// عرض الملاحظات في الصفحة
function displayNotes() {
    notesContainer.innerHTML = ''; // مسح الملاحظات القديمة

    // تقسيم الملاحظات إلى 3 صفوف من 3 ملاحظات
    const rows = [[], [], []];
    allNotes.forEach((note, index) => {
        const rowIndex = Math.floor(index / 3);
        rows[rowIndex].push(note);
    });

    // عرض الملاحظات كستيكرات ملونة
    rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');
        row.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.classList.add('note');
            noteDiv.style.backgroundColor = getRandomColor(); // تعيين لون عشوائي

            noteDiv.innerHTML = `
                <h3>${note.name} - ${note.grade}</h3>
                <p>${note.note}</p>
                ${note.image ? `<img src="${note.image}" alt="مرفق الصورة">` : ''}
            `;

            rowDiv.appendChild(noteDiv);
        });
        notesContainer.appendChild(rowDiv);
    });

    // التحكم في أزرار التصفح
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = allNotes.length < notesPerPage;
}

// دالة للحصول على لون عشوائي
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// التعامل مع أزرار التصفح
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadNotes("prev");
    }
});

nextBtn.addEventListener('click', () => {
    if (allNotes.length === notesPerPage) {
        currentPage++;
        loadNotes("next");
    }
});

// تحميل الملاحظات عند فتح الصفحة
window.onload = () => loadNotes();
