import {
  Box, Flex, Text, Badge, IconButton,
  Collapse, Image, Button, Tooltip,
} from '@chakra-ui/react'
import { LuChevronDown, LuBox, LuUpload, LuTrash2 } from 'react-icons/lu'
import { useAdmin } from '../hooks/useAdmin'
import ItemDetailPanel from './ItemDetailPanel'

export default function InventoryRow({
  item, isOpen, onToggle, onPhotoUpdate, onPhotoDelete, isLast
}) {
  const { isAdmin } = useAdmin()

  return (
    <Box borderBottom={isLast ? 'none' : '1px solid'} borderColor="gray.100">

      {/* Main clickable row */}
      <Flex
        px={4} py={3}
        align="center"
        cursor="pointer"
        onClick={onToggle}
        bg={isOpen ? 'blue.50' : 'white'}
        _hover={{ bg: isOpen ? 'blue.50' : 'gray.50' }}
        transition="background 0.15s"
        borderLeft="3px solid"
        borderLeftColor={isOpen ? 'blue.400' : 'transparent'}
      >
        {/* Name */}
        <Text flex={1} fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1}>
          {item.name}
        </Text>

        {/* Category badge */}
        <Box w="110px" display={{ base: 'none', md: 'block' }}>
          <Badge
            colorScheme="blue"
            variant="subtle"
            fontSize="0.65rem"
            borderRadius="md"
          >
            {item.category}
          </Badge>
        </Box>

        {/* Qty */}
        <Text w="80px" textAlign="right" fontSize="sm" fontWeight="700"
          color="green.500" display={{ base: 'none', md: 'block' }}>
          {item.totalQty.toLocaleString()}
        </Text>

        {/* Pallet count */}
        <Flex w="70px" justify="center" align="center" gap={1}
          display={{ base: 'none', md: 'flex' }}>
          <LuBox size={12} color="gray" />
          <Text fontSize="xs" color="gray.500">{item.pallets.length}</Text>
        </Flex>

        {/* Chevron */}
        <Box w="32px" display="flex" justifyContent="flex-end">
          <Box
            color="gray.400"
            transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
            transition="transform 0.25s"
          >
            <LuChevronDown size={16} />
          </Box>
        </Box>
      </Flex>

      {/* Expanded panel */}
      <Collapse in={isOpen} animateOpacity>
        <ItemDetailPanel
          item={item}
          isAdmin={isAdmin}
          onPhotoUpdate={onPhotoUpdate}
          onPhotoDelete={onPhotoDelete}
        />
      </Collapse>

    </Box>
  )
}