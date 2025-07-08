import {
    doc, getDoc, setDoc, updateDoc,
    collection, addDoc, getDocs, query,
    orderBy, serverTimestamp, Timestamp, deleteDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
    getStorage, ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";


let db, storage, currentAdminData, showToast, exitAdminView;
let listenersAttached = false;
const SUPER_ADMIN_EMAIL = "jacksonxp77@gmail.com"; // Seu email de super admin

const adminAppContainer = document.getElementById('admin-app-container');
const adminNavbar = document.getElementById('admin-navbar');
const modal = document.getElementById('edit-aluno-modal');

// Função principal de inicialização
export function initAdminPanel(firestoreInstance, authInstance, adminData, toastFunction, exitFunction) {
    db = firestoreInstance;
    storage = getStorage();
    currentAdminData = adminData;
    showToast = toastFunction;
    exitAdminView = exitFunction;

    const manageAdminsBtn = document.getElementById('goto-manage-admins-btn');
    if (manageAdminsBtn) {
        if (currentAdminData.email === SUPER_ADMIN_EMAIL) {
            manageAdminsBtn.classList.remove('hide');
        } else {
            manageAdminsBtn.classList.add('hide');
        }
    }

    if (!listenersAttached) {
        setupAdminEventListeners();
        listenersAttached = true;
    }
    showAdminView('novidades'); // Default to novidades view
}

function setupAdminEventListeners() {
    adminNavbar.addEventListener('click', (e) => {
        if (e.target.matches('.nav-btn')) showAdminView(e.target.dataset.view);
        if (e.target.id === 'goto-student-view-btn') exitAdminView();
    });

    adminAppContainer.addEventListener('click', (e) => {
        if (e.target.id === 'btn-cancelar-dia') handleCancelarDia();
        if (e.target.matches('.edit-aluno-btn')) openEditAlunoModal(e.target.dataset.userid);
        if (e.target.matches('.delete-novidade-btn')) handleDeleteNovidade(e.target.dataset.docId);
        if (e.target.matches('.reactivate-dia-btn')) handleReativarDia(e.target.dataset.dayid);
    });

    adminAppContainer.addEventListener('change', (e) => {
        if (e.target.matches('.admin-toggle-checkbox')) {
            const userId = e.target.dataset.userid;
            const isChecked = e.target.checked;
            handleToggleAdmin(userId, isChecked);
        }
    });

    adminAppContainer.addEventListener('submit', (e) => {
        e.preventDefault();
        if (e.target.id === 'novidade-form') handlePostNovidade(e);
    });

    modal.querySelector('#edit-aluno-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleUpdateAluno(e);
    });
    modal.querySelector('#modal-btn-cancel').addEventListener('click', () => modal.close());
}

function showAdminView(viewId) {
    adminAppContainer.innerHTML = '';
    const template = document.getElementById(`admin-view-template-${viewId}`);
    if (template) adminAppContainer.appendChild(template.content.cloneNode(true));
    document.querySelectorAll('#admin-navbar .nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewId);
    });
    loadDataForAdminView(viewId);
}

async function loadDataForAdminView(viewId) {
    if (!currentAdminData) return;
    switch (viewId) {
        case 'alunos': await loadAlunos(); break;
        case 'novidades': await loadExistingNovidades(); break;
        case 'cancelar': await loadDiasCancelados(); break;
        case 'gerenciar-admins': await loadAdminManagementList(); break;
    }
}

async function loadAdminManagementList() {
    const container = document.getElementById('admin-management-list');
    if (!container) return;
    container.innerHTML = '<p>Carregando usuários...</p>';

    try {
        const q = query(collection(db, "users"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        container.innerHTML = '';
        querySnapshot.forEach(docSnap => {
            const user = docSnap.data();
            const userId = docSnap.id;

            if (user.email === SUPER_ADMIN_EMAIL) {
                return;
            }

            const isAdminChecked = user.isAdmin ? 'checked' : '';

            container.innerHTML += `
                <div class="admin-user-card">
                    <div class="admin-user-info">
                        <h4>${user.name}</h4>
                        <p>${user.email}</p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" class="admin-toggle-checkbox" data-userid="${userId}" ${isAdminChecked}>
                        <span class="slider"></span>
                    </label>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar lista de usuários para gerenciamento:", error);
        container.innerHTML = '<p>Falha ao carregar usuários.</p>';
        showToast('Erro ao carregar usuários.', 'error');
    }
}

async function handleToggleAdmin(userId, newAdminStatus) {
    const userRef = doc(db, "users", userId);
    try {
        await updateDoc(userRef, {
            isAdmin: newAdminStatus
        });
        showToast(`Status de admin atualizado com sucesso!`, 'success');
    } catch (error) {
        console.error("Erro ao atualizar status de admin:", error);
        showToast('Falha ao atualizar o status do usuário.', 'error');
        await loadAdminManagementList();
    }
}

async function handlePostNovidade(e) {
    const form = e.target;
    const title = form.querySelector('#novidade-title').value;
    const content = form.querySelector('#novidade-content').value;
    const imageFile = form.querySelector('#novidade-image').files[0];
    const postButton = form.querySelector('#btn-postar-novidade');

    if (!title || !content) { showToast("Preencha título e conteúdo.", "error"); return; }

    postButton.disabled = true;

    try {
        let imageURL = null;
        if (imageFile) {
            const imageName = `${Date.now()}-${imageFile.name}`;
            const storageRef = ref(storage, `novidades_images/${imageName}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageURL = await getDownloadURL(snapshot.ref);
        }

        const novidadeData = { title, content, imageURL, timestamp: serverTimestamp() };
        await addDoc(collection(db, "novidades"), novidadeData);
        showToast("Novidade postada com sucesso!");
        form.reset();
        await loadExistingNovidades();
    } catch (error) {
        console.error("--- ERRO DETALHADO AO POSTAR NOVIDADE ---", error);
        let userMessage = "Falha ao postar novidade.";
        if (error.code) {
            switch (error.code) {
                case 'storage/unauthorized':
                    userMessage = "Erro de permissão. Verifique as regras do Storage.";
                    break;
                default:
                    userMessage = `Falha ao postar novidade. (Código: ${error.code})`;
            }
        }
        showToast(userMessage, "error");
    } finally {
        postButton.disabled = false;
    }
}

async function loadExistingNovidades() {
    const container = document.getElementById('existing-novidades-list');
    if (!container) return;
    container.innerHTML = '<p>Carregando...</p>';
    try {
        const q = query(collection(db, "novidades"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        if (snapshot.empty) { container.innerHTML = '<p>Nenhuma novidade postada ainda.</p>'; return; }

        container.innerHTML = '';
        snapshot.forEach(docSnap => {
            const post = docSnap.data();
            const postDate = post.timestamp?.toDate().toLocaleDateString('pt-BR');

            let imageHtml = '';
            if (post.imageURL) {
                imageHtml = `<img src="${post.imageURL}" alt="Imagem da novidade" style="width: 100%; max-width: 200px; border-radius: 4px; margin-top: 10px;">`;
            }

            container.innerHTML += `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; width: 100%;">
                        <div style="flex-grow: 1;">
                            <h4>${post.title}</h4>
                            <p>${post.content}</p>
                            ${imageHtml}
                            <p style="font-size: 0.8rem; color: #888; margin-top:10px;">Postado em: ${postDate || 'Data indisponível'}</p>
                        </div>
                        <button class="delete-novidade-btn btn-danger" data-doc-id="${docSnap.id}" style="padding: 5px 10px; flex-shrink: 0;">Excluir</button>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error("Erro ao carregar novidades existentes:", error);
        container.innerHTML = '<p>Falha ao carregar novidades.</p>';
    }
}

async function handleDeleteNovidade(docId) {
    if (!confirm("Tem certeza que deseja excluir esta novidade? Esta ação não pode ser desfeita.")) return;

    const docRef = doc(db, "novidades", docId);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const { imageURL } = docSnap.data();
            if (imageURL) {
                const imageRef = ref(storage, imageURL);
                try {
                    await deleteObject(imageRef);
                } catch (deleteError) {
                    if (deleteError.code === 'storage/object-not-found') {
                        console.warn(`Imagem ${imageURL} não encontrada no Storage, mas o post será removido.`);
                    } else {
                        console.error("Erro ao excluir imagem do storage, mas prosseguindo:", deleteError);
                    }
                }
            }
        }

        await deleteDoc(docRef);
        showToast("Novidade excluída com sucesso!");
        await loadExistingNovidades();
    } catch (error) {
        console.error("Erro ao excluir novidade: ", error);
        showToast("Falha ao excluir novidade.", "error");
    }
}


async function loadDiasCancelados() {
    const container = document.getElementById('dias-cancelados-list');
    if (!container) return;
    container.innerHTML = 'Carregando...';
    try {
        const q = query(collection(db, "diasCancelados"), orderBy("cancelledAt", "desc"));
        const snapshot = await getDocs(q);
        container.innerHTML = '';
        if (snapshot.empty) { container.innerHTML = '<p>Nenhum dia cancelado.</p>'; return; }
        snapshot.forEach(doc => {
            const dataFormatada = new Date(doc.id + 'T00:00:00').toLocaleDateString('pt-BR', { dateStyle: 'full' });
            container.innerHTML += `
                <div class="card" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
                    <span>${dataFormatada}</span>
                    <button class="reactivate-dia-btn btn-success" data-dayid="${doc.id}">Reativar Aula</button>
                </div>`;
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Erro ao carregar dias.</p>';
    }
}

async function handleCancelarDia() {
    const dateInput = document.getElementById('cancelar-date-input');
    const dateValue = dateInput.value;
    if (!dateValue) { showToast("Por favor, selecione uma data.", "error"); return; }
    try {
        const docRef = doc(db, "diasCancelados", dateValue);
        await setDoc(docRef, { cancelled: true, cancelledAt: serverTimestamp(), cancelledBy: currentAdminData.name });
        showToast(`O dia ${new Date(dateValue + 'T00:00:00').toLocaleDateString('pt-BR')} foi cancelado!`);
        dateInput.value = '';
        await loadDiasCancelados();
    } catch (error) {
        console.error("Erro ao cancelar dia: ", error);
        showToast("Falha ao cancelar o dia.", "error");
    }
}

async function handleReativarDia(dayId) {
    if (!confirm("Tem certeza que deseja reativar a aula para este dia?")) return;
    try {
        await deleteDoc(doc(db, "diasCancelados", dayId));
        showToast("O dia foi reativado com sucesso!");
        await loadDiasCancelados();
    } catch (error) {
        console.error("Erro ao reativar dia: ", error);
        showToast("Falha ao reativar o dia.", "error");
    }
}

async function loadAlunos() {
    const container = document.getElementById('alunos-list-container');
    if (!container) return;
    container.innerHTML = '<p>Carregando alunos...</p>';
    try {
        const q = query(collection(db, "users"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        container.innerHTML = '';
        querySnapshot.forEach(docSnap => {
            const user = docSnap.data();
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            let planoStatus, validade;

            if (user.validadePlano && user.validadePlano.toDate() >= hoje) {
                planoStatus = `<span style="color:var(--accent-secondary)">Em Dia</span>`;
                validade = user.validadePlano.toDate().toLocaleDateString('pt-BR');
            } else {
                planoStatus = `<span style="color:var(--danger-color)">Pendente</span>`;
                validade = user.validadePlano ? user.validadePlano.toDate().toLocaleDateString('pt-BR') : 'N/A';
            }
            container.innerHTML += `<div class="card"><h4>${user.name} ${user.isAdmin ? '👑' : ''}</h4><p>${user.email}</p><p><strong>Plano:</strong> ${planoStatus} | <strong>Validade:</strong> ${validade}</p><button class="edit-aluno-btn" data-userid="${docSnap.id}" style="margin-top: 10px;">Editar Plano</button></div>`;
        });
    } catch (error) {
        console.error("Erro ao carregar alunos:", error);
        container.innerHTML = '<p>Falha ao carregar alunos.</p>';
        showToast('Erro ao carregar alunos.', 'error');
    }
}
async function openEditAlunoModal(userId) {
    const form = document.getElementById('edit-aluno-form');
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) { showToast("Usuário não encontrado.", "error"); return; }
        const userData = userDoc.data();
        document.getElementById('modal-aluno-name').textContent = `Editar: ${userData.name}`;
        form.querySelector('#modal-aluno-id').value = userId;
        form.querySelector('#modal-plano-pago').checked = userData.mensalidadePaga || false;
        const validadeInput = form.querySelector('#modal-validade-plano');
        if (userData.validadePlano) {
            validadeInput.value = userData.validadePlano.toDate().toISOString().split('T')[0];
        } else {
            validadeInput.value = '';
        }
        modal.showModal();
    } catch (error) {
        showToast("Erro ao buscar dados do aluno.", "error");
    }
}
async function handleUpdateAluno(e) {
    const userId = document.getElementById('modal-aluno-id').value;
    const isPago = document.getElementById('modal-plano-pago').checked;
    const validadeStr = document.getElementById('modal-validade-plano').value;
    if (!userId) return;
    const dataToUpdate = {
        mensalidadePaga: isPago,
        validadePlano: validadeStr ? Timestamp.fromDate(new Date(validadeStr + 'T00:00:00')) : null
    };
    try {
        await updateDoc(doc(db, "users", userId), dataToUpdate);
        showToast("Plano do aluno atualizado com sucesso!");
        modal.close();
        await loadAlunos();
    } catch (error) {
        console.error("Erro ao atualizar aluno: ", error);
        showToast("Falha ao atualizar plano.", "error");
    }
}