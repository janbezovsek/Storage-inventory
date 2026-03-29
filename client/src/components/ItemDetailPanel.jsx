import { useRef } from 'react'
import {
  Box, Flex, Text, Badge, Button, Image,
  SimpleGrid, Divider,
} from '@chakra-ui/react'
import { LuUpload, LuTrash2 } from 'react-icons/lu'

export default function ItemDetailPanel({ item, isAdmin, onPhotoUpdate, onPhotoDelete }) {
  const fileRef = useRef()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onPhotoUpdate(item.id, url)
    }
  }

  return (
    <Box
      px={4} py={4}
      bg="blue.50"
      borderTop="1px solid"
      borderColor="blue.100"
    >
      <Flex gap={6} flexDirection={{ base: 'column', md: 'row' }}>

        {/* Left — pallet breakdown */}
        <Box flex={1}>
          <Text fontSize="xs" fontWeight="600" color="gray.500"
            textTransform="uppercase" letterSpacing="0.08em" mb={3}>
            Pallet Locations
          </Text>

          <Flex flexWrap="wrap" gap={2} mb={4}>
            {item.pallets.map(p => (
              <Box
                key={p.num}
                px={3} py={1.5}
                bg="white"
                border="1px solid"
                borderColor="blue.200"
                borderRadius="md"
                fontSize="sm"
              >
                <Text as="span" fontWeight="700" color="blue.500">{p.num}</Text>
                <Text as="span" color="gray.400" mx={1}>·</Text>
                <Text as="span" color="gray.600">{p.qty} pcs</Text>
              </Box>
            ))}
          </Flex>

          <Divider borderColor="blue.100" mb={4} />

          {/* Distribution bars */}
          <Text fontSize="xs" fontWeight="600" color="gray.500"
            textTransform="uppercase" letterSpacing="0.08em" mb={3}>
            Distribution
          </Text>

          <Flex direction="column" gap={2}>
            {item.pallets.map(p => {
              const pct = Math.round((p.qty / item.totalQty) * 100)
              return (
                <Flex key={p.num} align="center" gap={3}>
                  <Text fontSize="xs" color="gray.500" w="28px">{p.num}</Text>
                  <Box flex={1} bg="blue.100" borderRadius="full" h="6px">
                    <Box
                      bg="blue.400"
                      h="6px"
                      borderRadius="full"
                      w={`${pct}%`}
                      transition="width 0.6s ease"
                    />
                  </Box>
                  <Text fontSize="xs" color="gray.500" w="48px" textAlign="right">
                    {p.qty} pcs
                  </Text>
                </Flex>
              )
            })}
          </Flex>
        </Box>

        {/* Right — photo */}
        <Box w={{ base: 'full', md: '180px' }} flexShrink={0}>
          <Text fontSize="xs" fontWeight="600" color="gray.500"
            textTransform="uppercase" letterSpacing="0.08em" mb={3}>
            Photo
          </Text>

          {item.photo ? (
            <Image
              src={item.photo}
              alt={item.name}
              borderRadius="lg"
              objectFit="cover"
              w="100%"
              h="140px"
              border="1px solid"
              borderColor="blue.200"
              mb={2}
            />
          ) : (
            <Flex
              w="100%" h="140px"
              bg="white"
              border="2px dashed"
              borderColor="blue.200"
              borderRadius="lg"
              align="center"
              justify="center"
              direction="column"
              gap={1}
              mb={2}
            >
              <Text fontSize="xs" color="gray.400">No photo</Text>
            </Flex>
          )}

          {/* Admin controls */}
          {isAdmin && (
            <Flex direction="column" gap={2}>
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Button
                leftIcon={<LuUpload size={13} />}
                colorScheme="blue"
                size="xs"
                w="full"
                onClick={() => fileRef.current.click()}
              >
                Upload photo
              </Button>
              {item.photo && (
                <Button
                  leftIcon={<LuTrash2 size={13} />}
                  colorScheme="red"
                  variant="outline"
                  size="xs"
                  w="full"
                  onClick={() => onPhotoDelete(item.id)}
                >
                  Delete photo
                </Button>
              )}
            </Flex>
          )}
        </Box>

      </Flex>
    </Box>
  )
}