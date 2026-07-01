import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router'

// Mock the auth module to avoid making real API calls
vi.mock('../utils/auth', () => ({
    auth: {
        login: vi.fn(),
        register: vi.fn(),
    }
}))

// Mock the useNavigate hook from react-router to test navigation
const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

import Auth from '../pages/Auth/index.jsx'
import { auth } from '../utils/auth'
// Helper : render auth component with MemoryRouter and initial route
function renderAuth(mode = 'login') {
    return render(
        <MemoryRouter initialEntries={[`/auth?mode=${mode}`]}>
            <Auth />
        </MemoryRouter>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN FORM
// ─────────────────────────────────────────────────────────────────────────────
describe('Auth Page — Login form', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('displays the title "Bon retour" by default', () => {
        renderAuth('login')
        expect(screen.getByText('Bon retour')).toBeInTheDocument()
    })

    it('displays the email field', () => {
        renderAuth('login')
        expect(screen.getByPlaceholderText('vous@exemple.com')).toBeInTheDocument()
    })

    it('displays the password field', () => {
        renderAuth('login')
        const inputs = screen.getAllByPlaceholderText('••••••••')
        expect(inputs.length).toBeGreaterThan(0)
    })

    it('displays the "Se connecter" button', () => {
        renderAuth('login')
        expect(screen.getByRole('button', {
            name: 'Se connecter'
        })).toBeInTheDocument()
    })

    it('calls auth.login with email and password on submission', async () => {
        auth.login.mockResolvedValue({ user: { id: 1 }, plainTextToken: 'abc' })
        renderAuth('login')
        fireEvent.change(screen.getByPlaceholderText('vous@exemple.com'), {
            target: { value: 'jean@exemple.com' }
        })
        fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], {
            target: { value: 'motdepasse123' }
        })
        fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }))
        await waitFor(() => {
            expect(auth.login).toHaveBeenCalledWith({
                email: 'jean@exemple.com',
                password: 'motdepasse123',
            })
        })
    })

    it('redirects to /dashboard after a successful login', async () => {
        auth.login.mockResolvedValue({ user: { id: 1 }, plainTextToken: 'abc' })
        renderAuth('login')
        fireEvent.change(screen.getByPlaceholderText('vous@exemple.com'), {
            target: { value: 'jean@exemple.com' }
        })
        fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], {
            target: { value: 'motdepasse123' }
        })
        fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }))
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
        })
    })

    it('displays an error message if the login fails', async () => {
        auth.login.mockRejectedValue('Identifiants incorrects')
        renderAuth('login')
        fireEvent.change(screen.getByPlaceholderText('vous@exemple.com'), {
            target: { value: 'jean@exemple.com' }
        })
        fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], {
            target: { value: 'mauvaismdp' }
        })
        fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }))
        await waitFor(() => {
            expect(screen.getByText('Identifiants incorrects')).toBeInTheDocument()
        })
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER FORM
// ─────────────────────────────────────────────────────────────────────────────
describe('Auth Page — Register form', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('displays the title "Créer un compte"', () => {
        renderAuth('register')
        expect(screen.getByRole('heading', { name: 'Créer un compte' })).toBeInTheDocument()
    })

    it('displays the fields for first name, last name, email, and password', () => {
        renderAuth('register')
        expect(screen.getByPlaceholderText('Votre prénom')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Votre nom')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('vous@exemple.com')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('8 caractères minimum')).toBeInTheDocument()
    })

    it('displays the "Créer mon compte" button', () => {
        renderAuth('register')
        expect(screen.getByRole('button', {
            name: 'Créer mon compte'
        })).toBeInTheDocument()
    })

    it('displays an error message if the passwords do not match', async () => {
        renderAuth('register')
        fireEvent.change(screen.getByPlaceholderText('8 caractères minimum'), {
            target: { value: 'motdepasse123' }
        })
        fireEvent.change(screen.getByPlaceholderText('••••••••'), {
            target: { value: 'autremotdepasse' }
        })
        fireEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }))
        await waitFor(() => {
            expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeInTheDocument()
        })
    })
})