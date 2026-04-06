// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import InventoryRow from '../components/InventoryRow'
import { AdminContext } from '../context/AdminContext'

// mock item
const mockItem = {
  id: 1,
  name: 'Steel I-Beam 200mm',
  category: 'Steel',
  totalQty: 150,
  pallets: [
    { num: 'P12', qty: 40 },
    { num: 'P7',  qty: 60 },
    { num: 'P3',  qty: 50 },
  ],
  photos: [],
}

// helper — wraps component with Chakra and AdminContext
function renderRow(props = {}, adminValue = { isAdmin: false, token: null }) {
  return render(
    <ChakraProvider>
      <AdminContext.Provider value={adminValue}>
        <InventoryRow
          item={mockItem}
          isOpen={false}
          onToggle={vi.fn()}
          onPhotoUpdate={vi.fn()}
          onPhotoDelete={vi.fn()}
          isLast={false}
          {...props}
        />
      </AdminContext.Provider>
    </ChakraProvider>
  )
}

describe('InventoryRow', () => {

  it('renders item name', () => {
    renderRow()
    expect(screen.getByText('Steel I-Beam 200mm')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    renderRow()
    expect(screen.getByText('Steel')).toBeInTheDocument()
  })

  it('renders total quantity', () => {
    renderRow()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('renders pallet count', () => {
    renderRow()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('calls onToggle when row is clicked', () => {
    const onToggle = vi.fn()
    renderRow({ onToggle })
    fireEvent.click(screen.getByText('Steel I-Beam 200mm'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('does not show detail panel when closed', () => {
    renderRow({ isOpen: false })
    expect(screen.queryByText('Pallet Locations')).not.toBeVisible()
  })

  it('shows detail panel when open', () => {
    renderRow({ isOpen: true })
    expect(screen.getByText('Pallet Locations')).toBeVisible()
  })

  it('shows pallet numbers when open', () => {
  renderRow({ isOpen: true })
  expect(screen.getAllByText('P12').length).toBeGreaterThan(0)
  expect(screen.getAllByText('P7').length).toBeGreaterThan(0)
  expect(screen.getAllByText('P3').length).toBeGreaterThan(0)
})

  it('does not show upload button for non-admin', () => {
    renderRow({ isOpen: true }, { isAdmin: false, token: null })
    expect(screen.queryByText('Upload photo')).not.toBeInTheDocument()
  })

  it('shows upload button for admin', () => {
    renderRow({ isOpen: true }, { isAdmin: true, token: 'fake-token' })
    expect(screen.getByText('Upload photo')).toBeInTheDocument()
  })

})