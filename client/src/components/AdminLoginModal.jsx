import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  Input, Button, Text, VStack
} from '@chakra-ui/react'
import { useState } from 'react'
import { useAdmin } from '../hooks/useAdmin'

export default function AdminLoginModal({ isOpen, onClose }) {
  const { login } = useAdmin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const success = await login(username, password)
    if (success) {
      setUsername('')
      setPassword('')
      onClose()
    } else {
      setError('Incorrect username or password.')
    }
    setLoading(false)
  }

  const handleClose = () => {
    setUsername('')
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
              Enter your admin credentials to enable editing.
            </Text>
            <Input
              placeholder="Username"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              focusBorderColor="blue.400"
              size="md"
            />
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
          <Button variant="ghost" size="sm" onClick={handleClose}>Cancel</Button>
          <Button colorScheme="blue" size="sm" onClick={handleLogin} isLoading={loading}>
            Sign in
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}