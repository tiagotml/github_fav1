import { GithubUser } from "./GithubUser.js";

// classe que vai conter a lógica dos dados
// como os dados serão estruturados

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root);
        this.load();

        GithubUser.search('tiagotml').then(user => {
            console.log(user);
        });
    }
    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];

    }
    save(){
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
    }
    async add(username) {
        try {

            const userExists = this.entries.find(entry => entry.login === username);
            console.log(userExists);
            if (userExists) {
                throw new Error('Usuário já existe');
            }

            const user = await GithubUser.search(username);
            if (user.login === undefined) {
                throw new Error('Usuário não existe');
            }

            this.entries = [user, ...this.entries];
            this.update();
            this.save();
        } catch (error) {
            console.log(error.message);
        }
    }
    delete(user) {
        const filteredEntries = this.entries.filter(entry => entry.login !== user);
        this.entries = filteredEntries;
        this.update();
        this.save();
    }

}

// classe que vai criar a visualização e eventos do html

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root);
        this.tbody = this.root.querySelector('table tbody');

        this.update();
        this.onadd();
    }
    onadd() {
        const input = this.root.querySelector('input');
        const addButton = this.root.querySelector('.search button');
       addButton.addEventListener('click', () => {
            const input = this.root.querySelector('.search input');
            this.add(input.value);
        })
        input.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                this.add(input.value);
            }
        })
    }
    update() {
        this.removeAllTr();

        this.entries.forEach((user) => {
            const row = this.createRow();
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
            row.querySelector('.user a').href = `https://github.com/${user.login}`;
            row.querySelector('.user p').textContent = user.name;
            row.querySelector('.user img').alt = `Imagem de ${user.name}`;
            row.querySelector('.user span').textContent = user.login;
            row.querySelector('.repositories').textContent = user.public_repos;
            row.querySelector('.followers').textContent = user.followers;

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm(`Deseja remover o usuário ${user.login} da lista?`);
                if (isOk) {
                    this.delete(user.login);
                }
            }

            this.tbody.appendChild(row);
        })

    }
    createRow() {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td class="user">
            <img src="https://github.com/tiagotml.png" alt="">
            <a href="https://github.com/tiagotml" target="_blank">
                <p>Tiago Mota</p>
                <span>tiagotml</span>
            </a>
        </td>
        <td class="repositories">
            76
        </td>
        <td class="followers">
            9589
        </td>
        <td>
            <button class="remove">
                &times;
            </button>
        </td>

`
        return tr;
    }
    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove();
        })
    }
}