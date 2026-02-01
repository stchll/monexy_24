const Ui = {
    buttons: {
        signMenus: document.querySelectorAll('#signMenuBtn'),
        sign: document.getElementById('signBtn'),
        closeSign: document.getElementById('closeSignIn'),
        logOut: document.getElementById('logOutBtn'),
        addCard: document.getElementById('addCardBtn'),
        backToLogin: document.getElementById('backToLoginBtn'),
        sendMoneyBtn: document.getElementById('sendBtn'),
        transitionClose: document.getElementById('closeTransactionIn'),
        transactionSend: document.getElementById('transactionSend'),
        register: document.getElementById('registerBtn')
    },
    labels: {
        cardBallance: document.getElementById('cardBallance'),
        cardNumber: document.getElementById('cardNumber'),
        userAccount: document.getElementById('userAccount')
    },
    inputs: {
        email: document.querySelector('.signFrame input[type="email"]'),
        password: document.querySelector('.signFrame input[type="password"]'),
        transactionAmmount: document.getElementById('transactionAmmount')
    },
    frames: {
        sign: document.querySelector('.signFrame'),
        register: document.querySelector('.registerFrame'),
        transaction: document.querySelector('.transactionFrame')
    },
    pages: {
        welcome: document.querySelector('.welcomePage'),
        bank: document.querySelector('.bankPage')
    },
    containers: {
        empty: document.querySelector('.emptyContainer'),
        card: document.querySelector('.cardContainer'),
        data: document.querySelector('.dataContainer'),
        operations: document.querySelector('.operationsContainer'),
        transactionForm: document.getElementById('transactionForm'),
        transactionProcess: document.getElementById('transactionProcess'),
        transactionTitle: document.getElementById('transactionTitle')
    },
    selects: {
        recive: document.getElementById('reciverSelect')
    }
}

const USER_STORE_KEY = 'USERS_DATA_BASE'
const CURRENT_USER_KEY = 'CURRENT_USER'
const CARD_NUMBER_LENGHT = 12

let USERS_DATA_BASE = JSON.parse(localStorage.getItem(USER_STORE_KEY)) || []
let CURRENT_USER = JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null

function saveData() {
    localStorage.setItem(USER_STORE_KEY, JSON.stringify(USERS_DATA_BASE))
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(CURRENT_USER))
}

class User {
    find(email) {
        return USERS_DATA_BASE.find(u => u.email === email) || null
    }

    register(email, password) {
        if (!email || !password || password.length < 6) return null
        if (this.find(email)) return null

        const user = { email, password, card: null }
        USERS_DATA_BASE.push(user)
        CURRENT_USER = user
        saveData()
        return user
    }

    login(email, password) {
        const user = this.find(email)
        if (!user || user.password !== password) return null
        CURRENT_USER = user
        saveData()
        return user
    }
}

class Card {
    create() {
        if (!CURRENT_USER || CURRENT_USER.card) return
        CURRENT_USER.card = {
            type: 'Basic',
            blocked: false,
            ballance: 100,
            number: this.generateNumber(),
            cvv: this.generateCvv()
        }
        saveData()
        renderBank()
    }

    generateNumber() {
        let n = ''
        for (let i = 0; i < CARD_NUMBER_LENGHT; i++) {
            if (i > 0 && i % 4 === 0) n += ' '
            n += Math.floor(Math.random() * 10)
        }
        return n
    }

    generateCvv() {
        return Math.floor(100 + Math.random() * 900)
    }

    transaction() {
        const amount = Number(Ui.inputs.transactionAmmount.value)
        const reciverNumber = Ui.selects.recive.value
        if (!CURRENT_USER || !CURRENT_USER.card) return false
        if (!reciverNumber || amount <= 0) return false
        if (amount > CURRENT_USER.card.ballance) return false

        const sender = CURRENT_USER
        const reciver = USERS_DATA_BASE.find(
            u => u.card && u.card.number === reciverNumber
        )

        if (!reciver || reciver === sender) return false

        sender.card.ballance -= amount
        reciver.card.ballance += amount

        saveData()
        renderBank()
        return true
    }
}

const userSystem = new User()
const cardSystem = new Card()

function syncTransaction() {
    Ui.selects.recive.innerHTML = ''
    USERS_DATA_BASE.forEach(user => {
        if (user.card && CURRENT_USER.card && user !== CURRENT_USER) {
            const opt = document.createElement('option')
            opt.value = user.card.number
            opt.textContent = user.card.number
            Ui.selects.recive.append(opt)
        }
    })
}

function renderBank() {
    if (!CURRENT_USER) return
    Ui.labels.userAccount.textContent = CURRENT_USER.email

    if (CURRENT_USER.card) {
        Ui.labels.cardBallance.textContent = CURRENT_USER.card.ballance + '$'
        Ui.labels.cardNumber.textContent = CURRENT_USER.card.number
        Ui.containers.empty.style.display = 'none'
        Ui.containers.card.style.display = 'flex'
        Ui.containers.operations.style.display = 'flex'
        Ui.containers.data.style.display = 'flex'
    } else {
        Ui.containers.empty.style.display = 'flex'
        Ui.containers.card.style.display = 'none'
        Ui.containers.operations.style.display = 'none'
        Ui.containers.data.style.display = 'none'
    }
}

function openBank() {
    Ui.pages.welcome.style.display = 'none'
    Ui.pages.bank.style.display = 'block'
    renderBank()
}

function logOut() {
    CURRENT_USER = null
    localStorage.removeItem(CURRENT_USER_KEY)
    Ui.pages.bank.style.display = 'none'
    Ui.pages.welcome.style.display = 'flex'
}

Ui.buttons.signMenus.forEach(b => b.onclick = () => Ui.frames.sign.style.display = 'block')
Ui.buttons.closeSign.onclick = () => Ui.frames.sign.style.display = 'none'

Ui.buttons.sign.onclick = () => {
    const user = userSystem.login(Ui.inputs.email.value, Ui.inputs.password.value)
    if (user) {
        Ui.frames.sign.style.display = 'none'
        openBank()
    } else {
        Ui.frames.sign.style.display = 'none'
        Ui.frames.register.style.display = 'block'
    }
}

Ui.buttons.register.onclick = () => {
    const user = userSystem.register(Ui.inputs.email.value, Ui.inputs.password.value)
    if (user) {
        Ui.frames.register.style.display = 'none'
        openBank()
    }
}

Ui.buttons.backToLogin.onclick = () => {
    Ui.frames.register.style.display = 'none'
    Ui.frames.sign.style.display = 'block'
}

Ui.buttons.addCard.onclick = () => cardSystem.create()

Ui.buttons.sendMoneyBtn.onclick = () => {
    Ui.frames.transaction.style.display = 'block'
    Ui.containers.transactionForm.style.display = 'flex'
    Ui.containers.transactionProcess.style.display = 'none'
    syncTransaction()
}

Ui.buttons.transitionClose.onclick = () => Ui.frames.transaction.style.display = 'none'

Ui.buttons.transactionSend.onclick = () => cardSystem.transaction() && (
    Ui.containers.transactionForm.style.display = 'none',
    Ui.containers.transactionProcess.style.display = 'flex',
    Ui.containers.transactionTitle.style.display = 'none',

    setTimeout(function () {
        Ui.containers.transactionForm.style.display = 'flex',
            Ui.containers.transactionProcess.style.display = 'none',
            Ui.containers.transactionTitle.style.display = 'flex'

        Ui.inputs.transactionAmmount.value = 0
    }, 3000)
)

Ui.buttons.logOut.onclick = logOut

if (CURRENT_USER) openBank()
