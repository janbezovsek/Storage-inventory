import { useRef, useState } from 'react'
import {
  Box, Flex, Text, Button, Image, Divider, useToast,
  Modal, ModalOverlay, ModalContent, ModalCloseButton,
  IconButton,
} from '@chakra-ui/react'
import { LuUpload, LuTrash2, LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { useAdmin } from '../hooks/useAdmin'
import { uploadItemPhoto, deleteItemPhoto } from '../services/api'

export default function ItemDetailPanel({ item, isAdmin, onPhotoUpdate, onPhotoDelete }) {
  const { token } = useAdmin()
  const fileRef = useRef()
  const toast = useToast()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const photos = item.photos || []

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const prevPhoto = () => {
    setLightboxIndex(i => (i === 0 ? photos.length - 1 : i - 1))
  }

  const nextPhoto = () => {
    setLightboxIndex(i => (i === photos.length - 1 ? 0 : i + 1))
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      await uploadItemPhoto(item.id, file, token)
      onPhotoUpdate()
      toast({
        title: 'Photo uploaded',
        description: `Photo added for ${item.name}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      })
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Could not upload photo. Try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      })
    }
  }

  const handleDelete = async (photoId) => {
    try {
      await deleteItemPhoto(photoId, token)
      onPhotoDelete()
      toast({
        title: 'Photo deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      })
    } catch {
      toast({
        title: 'Delete failed',
        description: 'Could not delete photo. Try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      })
    }
  }

  return (
    <Box px={4} py={4} bg="blue.50" borderTop="1px solid" borderColor="blue.100">
      <Flex gap={6} flexDirection={{ base: 'column', md: 'row' }}>

        {/* Left — pallet breakdown */}
        <Box flex={1}>
          <Text fontSize="xs" fontWeight="600" color="gray.500"
            textTransform="uppercase" letterSpacing="0.08em" mb={3}>
            Pallet Locations
          </Text>

          <Flex flexWrap="wrap" gap={2} mb={4}>
            {item.pallets.map(p => (
              <Box key={p.num} px={3} py={1.5} bg="white"
                border="1px solid" borderColor="blue.200" borderRadius="md" fontSize="sm">
                <Text as="span" fontWeight="700" color="blue.500">{p.num}</Text>
                <Text as="span" color="gray.400" mx={1}>·</Text>
                <Text as="span" color="gray.600">{p.qty} pcs</Text>
              </Box>
            ))}
          </Flex>

          <Divider borderColor="blue.100" mb={4} />

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
                    <Box bg="blue.400" h="6px" borderRadius="full"
                      w={`${pct}%`} transition="width 0.6s ease" />
                  </Box>
                  <Text fontSize="xs" color="gray.500" w="48px" textAlign="right">
                    {p.qty} pcs
                  </Text>
                </Flex>
              )
            })}
          </Flex>
          {/* Notes */}
{(item.notes || isAdmin) && (
  <>
    <Divider borderColor="blue.100" my={4} />
    <Text fontSize="xs" fontWeight="600" color="gray.500"
      textTransform="uppercase" letterSpacing="0.08em" mb={2}>
      Notes
    </Text>
    {item.notes ? (
      <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
        {item.notes}
      </Text>
    ) : (
      <Text fontSize="sm" color="gray.400" fontStyle="italic">
        No notes for this item.
      </Text>
    )}
  </>
)}
        </Box>

        {/* Right — photos */}
        <Box w={{ base: 'full', md: '220px' }} flexShrink={0}>
          <Text fontSize="xs" fontWeight="600" color="gray.500"
            textTransform="uppercase" letterSpacing="0.08em" mb={3}>
            Photos {photos.length > 0 && `(${photos.length})`}
          </Text>

          {/* Photo grid */}
          {photos.length > 0 ? (
            <Flex flexWrap="wrap" gap={2} mb={2}>
              {photos.map((photo, index) => (
                <Box key={photo.id} position="relative" role="group">
                  <Image
                    src={`http://localhost:5001${photo.url}`}
                    alt={`${item.name} photo ${index + 1}`}
                    w="96px"
                    h="96px"
                    objectFit="cover"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="blue.200"
                    cursor="pointer"
                    onClick={() => openLightbox(index)}
                    transition="opacity 0.15s"
                    _hover={{ opacity: 0.85 }}
                  />
                  {isAdmin && (
                    <IconButton
                      aria-label="Delete photo"
                      icon={<LuTrash2 size={11} />}
                      size="xs"
                      colorScheme="red"
                      position="absolute"
                      top={1}
                      right={1}
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                      transition="opacity 0.15s"
                      onClick={() => handleDelete(photo.id)}
                    />
                  )}
                </Box>
              ))}
            </Flex>
          ) : (
            <Flex w="100%" h="96px" bg="white" border="2px dashed"
              borderColor="blue.200" borderRadius="lg" align="center"
              justify="center" mb={2}>
              <Text fontSize="xs" color="gray.400">No photos</Text>
            </Flex>
          )}

          {/* Upload button — admin only */}
          {isAdmin && (
            <>
              <input type="file" accept="image/*" ref={fileRef}
                style={{ display: 'none' }} onChange={handleFileChange} />
              <Button leftIcon={<LuUpload size={13} />} colorScheme="blue"
                size="xs" w="full" onClick={() => fileRef.current.click()}>
                Upload photo
              </Button>
            </>
          )}
        </Box>
      </Flex>

      {/* Lightbox */}
      <Modal isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)}
        size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" zIndex={10} />
          <Flex align="center" justify="center" position="relative" px={10}>

            {/* Left arrow */}
            {photos.length > 1 && (
              <IconButton
                aria-label="Previous photo"
                icon={<LuChevronLeft size={24} />}
                onClick={prevPhoto}
                position="absolute"
                left={0}
                colorScheme="whiteAlpha"
                borderRadius="full"
                size="lg"
              />
            )}

            {/* Image */}
            {photos[lightboxIndex] && (
              <Image
                src={`http://localhost:5001${photos[lightboxIndex].url}`}
                alt={item.name}
                maxH="80vh"
                maxW="100%"
                objectFit="contain"
                borderRadius="lg"
              />
            )}

            {/* Right arrow */}
            {photos.length > 1 && (
              <IconButton
                aria-label="Next photo"
                icon={<LuChevronRight size={24} />}
                onClick={nextPhoto}
                position="absolute"
                right={0}
                colorScheme="whiteAlpha"
                borderRadius="full"
                size="lg"
              />
            )}
          </Flex>

          {/* Photo counter */}
          {photos.length > 1 && (
            <Text textAlign="center" color="whiteAlpha.700" fontSize="sm" mt={3}>
              {lightboxIndex + 1} / {photos.length}
            </Text>
          )}
        </ModalContent>
      </Modal>
    </Box>
  )
}