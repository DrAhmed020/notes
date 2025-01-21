import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// الحصول على النموذج وعناصر الصفحة
const noteForm = document.getElementById('noteForm');
const notesContainer = document.getElementById('notesContainer');

// دالة لإضافة ملاحظة جديدة
function addNoteToPage(name, grade, note, imageURL) {
    const noteDiv = document.createElement('div');
    noteDiv.classList.add('note');

    // تعيين لون عشوائي لكل ملاحظة
    const randomColor = getRandomColor();
    noteDiv.style.backgroundColor = randomColor;

    // إضافة المحتويات للملاحظة
    noteDiv.innerHTML = `
        <h3>${name} - ${grade}</h3>
        <p>${note}</p>
        ${imageURL ? `<img src="${imageURL}" alt="مرفق الصورة">` : ''}
    `;

    // إضافة الملاحظة إلى صفحة الملاحظات
    notesContainer.appendChild(noteDiv);
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

// دالة لرفع الصورة إلى Firebase Storage
async function uploadImage(imageFile) {
    const imageRef = ref(storage, `images/${imageFile.name}-${Date.now()}`);
    await uploadBytes(imageRef, imageFile);
    return await getDownloadURL(imageRef);
}

// التعامل مع إرسال النموذج
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // منع إرسال النموذج بشكل تقليدي

    const name = document.getElementById('name').value;
    const grade = document.getElementById('grade').value;
    const note = document.getElementById('note').value;
    const image = document.getElementById('image').files[0];

    let imageURL = null;
    if (image) {
        imageURL = await uploadImage(image); // رفع الصورة والحصول على الرابط
    }

    // تخزين الملاحظة في Firestore
    await addDoc(collection(db, "notes"), {
        name,
        grade,
        note,
        image: imageURL,
        timestamp: Date.now() // إضافة توقيت لتسهيل الفرز لاحقًا
    });

    // إضافة الملاحظة إلى الصفحة
    addNoteToPage(name, grade, note, imageURL);

    // إعادة تعيين النموذج بعد الإرسال
    noteForm.reset();
});
