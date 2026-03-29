import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  Input, Button, Text, VStack
} from '@chakra-ui/react'
import { useState } from 'react'
import { useAdmin } from '../hooks/useAdmin'

export default function AdminLoginModal({ isOpen, onClose }) {
  const { login } = useAdmin()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      const success = login(password)
      if (success) {
        setPassword('')
        setError('')
        onClose()
      } else {
        setError('Incorrect password.')
      }
      setLoading(false)
    }, 400)
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="sm">
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent borderRadius="xl">
        <ModalHeader fontSize="md" fontWeight="700">Admin Access</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Enter the admin password to enable editing.
            </Text>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              focusBorderColor="blue.400"
              size="md"
            />
            {error && (
              <Text fontSize="sm" color="red.500">{error}</Text>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            size="sm"
            onClick={handleLogin}
            isLoading={loading}
          >
            Sign in
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}