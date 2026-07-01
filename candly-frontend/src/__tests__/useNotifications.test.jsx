import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NotificationProvider } from '../hooks/NotificationProvider.jsx'
import { useNotifications } from '../hooks/useNotifications.jsx'

// Test component to use the useNotifications hook
function TestComponent() {
    const { notifications, pushNotification } = useNotifications()
    return (
        <div>
            <button onClick={() => pushNotification({
                message: 'Test !', type:
                    'success'
            })}>
                Ajouter notification
            </button>
            <ul>
                {notifications.map(n => (
                    <li key={n.id}>{n.message}</li>
                ))}
            </ul>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS HOOK TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('useNotifications', () => {
    it('starts with an empty notification list', () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        )

        expect(screen.queryByRole('listitem')).toBeNull()
    })

    it('adds a notification when pushNotification is called', async () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        )
        
        act(() => {
            screen.getByRole('button').click()
        })
        
        expect(screen.getByText('Test !')).toBeInTheDocument()
    })

    it('throws an error if used outside the Provider', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        expect(() => {
            render(<TestComponent />)
        }).toThrow('useNotifications must be used within a NotificationProvider')

        consoleSpy.mockRestore()
    })
})