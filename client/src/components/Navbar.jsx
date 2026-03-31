import {
  Box, Flex, Text, IconButton, Tooltip, Badge
} from '@chakra-ui/react'
import { LuLock, LuLockOpen } from 'react-icons/lu'
import { useAdmin } from '../hooks/useAdmin'
import { useState } from 'react'
import AdminLoginModal from './AdminLoginModal'

export default function Navbar() {
  const { isAdmin, logout } = useAdmin()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={{ base: 4, md: 8 }}
        py={3}
        position="sticky"
        top={0}
        zIndex={100}
        boxShadow="sm"
      >
        <Flex align="center" justify="space-between" maxW="900px" mx="auto">

          {/* Logo / Title */}
          <Flex align="center" gap={2}>
            <Box w="10px" h="24px" bg="blue.500" borderRadius="2px" />
            <Text
              fontWeight="800"
              fontSize="lg"
              letterSpacing="-0.03em"
              color="gray.800"
            >
              Skladišče Logatec
            </Text>
          </Flex>

          {/* Right side */}
          <Flex align="center" gap={3}>
            {isAdmin && (
              <Badge colorScheme="blue" fontSize="0.7rem" px={2} py={1} borderRadius="md">
                Admin
              </Badge>
            )}
            <Tooltip
              label={isAdmin ? 'Exit admin mode' : 'Admin login'}
              fontSize="xs"
            >
              <IconButton
                aria-label="Admin toggle"
                icon={isAdmin ? <LuLockOpen size={16} /> : <LuLock size={16} />}
                variant="ghost"
                size="sm"
                color={isAdmin ? 'blue.500' : 'gray.400'}
                onClick={() => isAdmin ? logout() : setModalOpen(true)}
              />
            </Tooltip>
          </Flex>

        </Flex>
      </Box>

      <AdminLoginModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}