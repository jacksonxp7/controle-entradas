// START OF FILE script.js (CONTROLADOR PRINCIPAL - VERSÃO FINAL E COMPLETA E CORRIGIDA)

// --- IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
    getAuth, onAuthStateChanged, GoogleAuthProvider,
    signOut, createUserWithEmailAndPassword,
    signInWithEmailAndPassword, updateProfile,
    signInWithRedirect, getRedirectResult
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
    getFirestore, doc, getDoc, setDoc,
    collection, getDocs, query, orderBy, serverTimestamp, onSnapshot,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
    getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCs6aCasD3PP6lJSj2wmRbIqpsWw1dB8LY",
    authDomain: "bjj-takano.firebaseapp.com",
    projectId: "bjj-takano",
    storageBucket: "gs://bjj-takano.firebasestorage.app",
    messagingSenderId: "661214521765",
    appId: "1:661214521765:web:1671d17c7fe36832aea04c",
    measurementId: "G-M812JNCNL7"
};

// --- INICIALIZAÇÃO ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let currentUserData = null;
let unsubscribeRollCall = null;
let adminModule = null;

let loadingScreen, authScreen, studentPanel, adminPanel, appContainer, navbar, toastContainer, gotoAdminBtn;
let currentStudentView = 'home';


// --- FUNÇÃO DE INICIALIZAÇÃO PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {
    loadingScreen = document.getElementById('loading');
    authScreen = document.getElementById('auth-screen');
    studentPanel = document.getElementById('student-panel');
    adminPanel = document.getElementById('admin-panel');
    appContainer = document.getElementById('app-container');
    navbar = document.getElementById('navbar');
    toastContainer = document.getElementById('toast-container');
    gotoAdminBtn = document.getElementById('goto-admin-btn');

    loadingScreen.classList.remove('hide');

    setupEventListeners();
    setupAuthObserver();
});


// --- LÓGICA DE UI E NAVEGAÇÃO GERAL ---
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function switchToStudentView() {
    adminPanel.classList.add('hide');
    studentPanel.classList.remove('hide');
    showStudentView(currentStudentView);
    if (currentUserData && currentUserData.isAdmin) {
        gotoAdminBtn.classList.remove('hide');
    }
}

async function switchToAdminView() {
    studentPanel.classList.add('hide');
    gotoAdminBtn.classList.add('hide');
    adminPanel.classList.remove('hide');

    if (!adminModule) {
        adminModule = await import('./admin.js');
    }
    adminModule.initAdminPanel(db, auth, currentUserData, showToast, switchToStudentView);
}

// --- LÓGICA DE AUTENTICAÇÃO CENTRALIZADA ---
function setupAuthObserver() {
    onAuthStateChanged(auth, async (user) => {
        authScreen.classList.add('hide');
        studentPanel.classList.add('hide');
        adminPanel.classList.add('hide');
        gotoAdminBtn.classList.add('hide');

        if (user) {
            await ensureUserProfile(user);
            if (currentUserData) {
                studentPanel.classList.remove('hide');
                switchToStudentView();
            } else {
                authScreen.classList.remove('hide');
            }
        } else {
            currentUserData = null;
            authScreen.classList.remove('hide');
        }
        loadingScreen.classList.add('hide');
    });
}

async function ensureUserProfile(user) {
    const userRef = doc(db, "users", user.uid);
    try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            currentUserData = { uid: user.uid, ...docSnap.data() };
        } else {
            const newUserProfile = {
                name: user.displayName || 'Novo Aluno',
                email: user.email,
                photoURL: user.photoURL || null,
                createdAt: serverTimestamp(),
                isAdmin: false,
                validadePlano: null
            };
            await setDoc(userRef, newUserProfile);
            currentUserData = { uid: user.uid, ...newUserProfile };
        }
    } catch (error) {
        console.error("Erro crítico ao garantir o perfil do usuário:", error);
        showToast("Falha ao carregar seu perfil. Tente novamente.", "error");
        currentUserData = null;
        await signOut(auth);
    }
}

// --- LÓGICA DA VISÃO DE ALUNO ---
function showStudentView(viewId) {
    currentStudentView = viewId;
    if (unsubscribeRollCall) {
        unsubscribeRollCall();
        unsubscribeRollCall = null;
    }
    appContainer.innerHTML = '';
    const template = document.getElementById(`view-template-${viewId}`);
    if (template) {
        appContainer.appendChild(template.content.cloneNode(true));
    }
    document.querySelectorAll('#navbar .nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    loadDataForStudentView(viewId);
}

function loadDataForStudentView(viewId) {
    if (!currentUserData) return;
    switch (viewId) {
        case 'home': loadHomeFeed(); break;
        case 'perfil': renderProfile(); break;
        case 'aulas': loadAvailableClasses(); break;
        case 'chamada': listenToDailyRollCall(); break;
    }
}

function renderProfile() {
    if (!currentUserData) return;
    document.getElementById('profile-pic-img').src = currentUserData.photoURL || 'WhatsApp Image 2025-06-24 at 19.19.25.jpeg';
    document.getElementById('profile-name').textContent = currentUserData.name || 'Nome não definido';
    document.getElementById('profile-email').textContent = currentUserData.email;

    const planStatusEl = document.getElementById('profile-plan-status');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (currentUserData.validadePlano && currentUserData.validadePlano.toDate() >= hoje) {
        const validade = currentUserData.validadePlano.toDate();
        const diasRestantes = Math.round((validade - hoje) / (1000 * 60 * 60 * 24)) + 1;
        planStatusEl.innerHTML = `<p><strong>Plano Em Dia</strong></p><p>Válido por mais ${diasRestantes} dia(s)</p>`;
        planStatusEl.style.color = 'var(--accent-secondary)';
    } else {
        planStatusEl.innerHTML = `<p><strong>Plano Pendente</strong></p><p>Fale com a administração.</p>`;
        planStatusEl.style.color = 'var(--danger-color)';
    }
}

async function loadHomeFeed() {
    const list = document.getElementById('home-feed');
    if (!list) return;
    list.innerHTML = '<p>Carregando novidades...</p>';
    try {
        const q = query(collection(db, "novidades"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        list.innerHTML = '';
        if (snapshot.empty) {
            list.innerHTML = '<div class="card"><p>Nenhuma novidade no momento.</p></div>';
            return;
        }
        snapshot.forEach(doc => {
            const post = doc.data();
            const postDate = post.timestamp?.toDate().toLocaleDateString('pt-BR') || 'Data indisponível';

            let imageHtml = '';
            if (post.imageURL) {
                imageHtml = `<img src="${post.imageURL}" alt="${post.title}" style="width: 100%; border-radius: 8px; margin-top: 15px; max-width: 400px; max-height: 50vh;">`;
            }

            list.innerHTML += `
                <div class="card">
                    <h3>${post.title || ''}</h3>
                    <p>${post.content || ''}</p>
                    ${imageHtml}
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 15px; text-align: right;">Postado em: ${postDate}</p>
                </div>`;
        });
    } catch (e) {
        console.error("Erro ao carregar novidades:", e);
        list.innerHTML = '<div class="card"><p>Erro ao carregar novidades.</p></div>';
    }
}

async function loadAvailableClasses() {
    const listContainer = document.getElementById('aulas-list');
    if (!listContainer) return;
    listContainer.innerHTML = '<p>Carregando aulas...</p>';
    try {
        const q = query(collection(db, "aulas"), orderBy("diaDaSemana"));
        const querySnapshot = await getDocs(q);
        listContainer.innerHTML = '';
        if (querySnapshot.empty) { listContainer.innerHTML = '<div class="card"><p>Nenhuma aula cadastrada.</p></div>'; return; }
        querySnapshot.forEach(doc => {
            const aula = doc.data();
            listContainer.innerHTML += `<div class="card"><h3>${aula.nome || 'Aula sem nome'}</h3><p><strong>Horário:</strong> ${aula.horario || 'N/A'}</p><p><strong>Instrutor:</strong> ${aula.instrutor || 'N/A'}</p></div>`;
        });
    } catch (error) {
        console.error("Erro ao carregar aulas:", error);
        listContainer.innerHTML = '<div class="card"><p>Não foi possível carregar as aulas.</p></div>';
    }
}

function getTodayDocId() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

async function listenToDailyRollCall() {
    const todayId = getTodayDocId();
    try {
        const cancelledDocRef = doc(db, "diasCancelados", todayId);
        const cancelledDocSnap = await getDoc(cancelledDocRef);
        if (cancelledDocSnap.exists()) {
            const chamadaView = document.getElementById('chamada');
            if (chamadaView) chamadaView.innerHTML = `<div class="chamada-header"><h2>Chamada do Dia</h2><p>${new Date().toLocaleDateString('pt-BR', { dateStyle: 'full' })}</p></div><div class="card" style="text-align: center; background-color: var(--danger-color);"><h3>Aula Cancelada</h3><p>A aula de hoje foi cancelada. Bom descanso!</p></div>`;
            return;
        }
    } catch (error) { console.error("Erro ao verificar dias cancelados: ", error); }

    const rollCallRef = doc(db, "chamadaDiaria", todayId);
    if (document.getElementById('chamada-data-atual')) {
        document.getElementById('chamada-data-atual').textContent = new Date().toLocaleDateString('pt-BR', { dateStyle: 'full' });
    }

    unsubscribeRollCall = onSnapshot(rollCallRef, (docSnap) => {
        const confirmadosList = document.getElementById('confirmados-list');
        const ausentesList = document.getElementById('ausentes-list');
        const confirmadosCount = document.getElementById('confirmados-count');
        const ausentesCount = document.getElementById('ausentes-count');

        if (!confirmadosList || !ausentesList || !confirmadosCount || !ausentesCount) return;

        confirmadosList.innerHTML = '';
        ausentesList.innerHTML = '';
        let cCount = 0;
        let aCount = 0;

        const participantes = docSnap.exists() ? docSnap.data().participantes || {} : {};

        const sortedParticipantes = Object.entries(participantes)
            .sort(([, a], [, b]) => (a.nome || '').localeCompare(b.nome || ''));

        for (const [, data] of sortedParticipantes) {
            const participantHtml = `<div class="participant-item">
                <img src="${data.photoURL || 'WhatsApp Image 2025-06-24 at 19.19.25.jpeg'}" alt="Foto de ${data.nome}" class="participant-photo">
                <span class="participant-name">${data.nome}</span>
            </div>`;

            if (data.status === 'confirmado') {
                confirmadosList.innerHTML += participantHtml;
                cCount++;
            } else if (data.status === 'ausente') {
                ausentesList.innerHTML += participantHtml;
                aCount++;
            }
        }

        confirmadosCount.textContent = cCount;
        ausentesCount.textContent = aCount;

        const myStatus = participantes[currentUserData.uid]?.status;
        renderUserActionButtons(myStatus);
    });
}

function renderUserActionButtons(status) {
    const actionContainer = document.getElementById('user-action-container');
    if (!actionContainer) return;
    let buttonsHtml = '';
    if (status === 'confirmado') { buttonsHtml = `<p>✅ Você confirmou presença!</p><button class="roll-call-action-btn btn-danger" data-status="ausente">Mudar para "Não Vou"</button>`; }
    else if (status === 'ausente') { buttonsHtml = `<p>❌ Você indicou ausência.</p><button class="roll-call-action-btn btn-success" data-status="confirmado">Mudar para "Vou"</button>`; }
    else { buttonsHtml = `<button class="roll-call-action-btn btn-success" data-status="confirmado">Confirmar Presença</button><button class="roll-call-action-btn btn-danger" data-status="ausente">Negar Presença</button>`; }
    actionContainer.innerHTML = buttonsHtml;
}

async function updateMyRollCallStatus(newStatus) {
    if (!currentUserData) return;

    const actionContainer = document.getElementById('user-action-container');
    if (actionContainer) {
        actionContainer.querySelectorAll('button').forEach(btn => btn.disabled = true);
    }

    const todayId = getTodayDocId();
    const rollCallRef = doc(db, "chamadaDiaria", todayId);
    const myData = {
        nome: currentUserData.name,
        photoURL: currentUserData.photoURL || null,
        status: newStatus,
        timestamp: serverTimestamp()
    };

    try {
        const docSnap = await getDoc(rollCallRef);

        if (docSnap.exists()) {
            await updateDoc(rollCallRef, {
                [`participantes.${currentUserData.uid}`]: myData
            });
        } else {
            await setDoc(rollCallRef, {
                participantes: {
                    [currentUserData.uid]: myData
                }
            });
        }
        showToast(`Sua presença foi atualizada!`);
    } catch (error) {
        console.error("Erro ao atualizar presença: ", error);
        showToast("Ocorreu um erro ao atualizar sua presença.", 'error');
    }
}


function getAuthErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use': return 'Este e-mail já está cadastrado. Tente fazer login.';
        case 'auth/weak-password': return 'A senha é muito fraca. Use pelo menos 6 caracteres.';
        case 'auth/invalid-email': return 'O formato do e-mail é inválido.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': return 'E-mail ou senha incorretos.';
        default: return 'Ocorreu um erro. Tente novamente.';
    }
}

async function handleEmailLogin(e) {
    e.preventDefault();
    loadingScreen.classList.remove('hide');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        showToast(getAuthErrorMessage(error.code), 'error');
        loadingScreen.classList.add('hide');
    }
}

async function handleEmailRegistration(e) {
    e.preventDefault();
    loadingScreen.classList.remove('hide');
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await ensureUserProfile(userCredential.user);
    } catch (error) {
        showToast(getAuthErrorMessage(error.code), 'error');
        loadingScreen.classList.add('hide');
    }
}

function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider).catch(error => showToast(getAuthErrorMessage(error.code), "error"));
    getRedirectResult(auth).catch(error => showToast(getAuthErrorMessage(error.code), "error"));
}

async function handleLogout() {
    if (unsubscribeRollCall) {
        unsubscribeRollCall();
        unsubscribeRollCall = null;
    }
    await signOut(auth);
}

async function handleProfilePictureUpload(file) {
    if (!currentUserData) return;
    const spinner = document.getElementById('pic-upload-spinner');
    spinner.classList.remove('hide');
    const storageRef = ref(storage, `profile_pictures/${currentUserData.uid}/${file.name}`);
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        await setDoc(doc(db, "users", currentUserData.uid), { photoURL: downloadURL }, { merge: true });
        if (auth.currentUser) { await updateProfile(auth.currentUser, { photoURL: downloadURL }); }
        currentUserData.photoURL = downloadURL;
        document.getElementById('profile-pic-img').src = downloadURL;
        showToast('Foto de perfil atualizada!');
    } catch (error) {
        showToast(`Erro no upload: ${error.code}`, 'error');
    } finally {
        spinner.classList.add('hide');
    }
}

// --- HANDLERS DE EVENTOS GERAIS ---
function setupEventListeners() {
    document.getElementById('show-register-form').addEventListener('click', (e) => { e.preventDefault(); document.getElementById('login-form').classList.add('hide'); document.getElementById('register-form').classList.remove('hide'); });
    document.getElementById('show-login-form').addEventListener('click', (e) => { e.preventDefault(); document.getElementById('register-form').classList.add('hide'); document.getElementById('login-form').classList.remove('hide'); });
    document.getElementById('login-form').addEventListener('submit', handleEmailLogin);
    document.getElementById('register-form').addEventListener('submit', handleEmailRegistration);
    document.getElementById('login-google-btn').addEventListener('click', handleGoogleLogin);

    navbar.addEventListener('click', (e) => { if (e.target.matches('.nav-btn')) showStudentView(e.target.dataset.view); });
    gotoAdminBtn.addEventListener('click', switchToAdminView);

    document.body.addEventListener('click', (e) => {
        const target = e.target;

        if (target.id === 'logout-btn') {
            handleLogout();
        }

        if (target.matches('.roll-call-action-btn')) {
            const newStatus = target.dataset.status;
            updateMyRollCallStatus(newStatus);
        }
    });

    document.body.addEventListener('change', (e) => {
        if (e.target.id === 'profile-pic-upload') {
            const file = e.target.files[0];
            if (file) handleProfilePictureUpload(file);
        }
    });
}