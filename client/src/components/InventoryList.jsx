import { useState, useEffect, useRef } from 'react'
import {
  Box, Flex, Text, Input, InputGroup, InputLeftElement,
  Select, Button, SimpleGrid, Stat, StatLabel, StatNumber,
  Alert, AlertIcon, AlertDescription, CloseButton, Spinner, useToast,  Badge,
} from '@chakra-ui/react'
import { LuSearch, LuUpload, LuRotateCcw } from 'react-icons/lu'
import { useAdmin } from '../hooks/useAdmin'
import InventoryRow from './InventoryRow'
import { fetchItems, importItemsFromExcel } from '../services/api'

export default function InventoryList() {
  const { isAdmin, token } = useAdmin()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [openId, setOpenId] = useState(null)
  const [importing, setImporting] = useState(false)
  const importRef = useRef()
  const toast = useToast()

  // fetch on mount
  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    setLoading(true)
    try {
      const data = await fetchItems()
      setItems(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))]

  const filtered = items.filter(item => {
  const matchName = item.name.toLowerCase().includes(search.toLowerCase())
  const matchPallet = item.pallets.some(p =>
    p.num.toLowerCase() === search.toLowerCase()
  )
  const matchSearch = matchName || matchPallet
  const matchCat = category === 'All' || item.category === category
  return matchSearch && matchCat
})

  const handleImport = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  setImporting(true)
  try {
    const result = await importItemsFromExcel(file, token)
    await loadItems()
    setOpenId(null)
    toast({
      title: 'Import successful',
      description: result.deleted?.length > 0
        ? `Updated inventory. Removed: ${result.deleted.join(', ')}`
        : 'Inventory has been updated from your Excel file.',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    })
  } catch {
    toast({
      title: 'Import failed',
      description: 'Check your Excel format and try again.',
      status: 'error',
      duration: 4000,
      isClosable: true,
      position: 'top-right',
    })
  } finally {
    setImporting(false)
    importRef.current.value = ''
  }
}

  const highestPallet = items
  .flatMap(i => i.pallets.map(p => p.num))
  .map(num => parseInt(num.replace(/\D/g, '')))
  .filter(n => !isNaN(n))
  .reduce((max, n) => Math.max(max, n), 0)

const highestPalletLabel = highestPallet > 0 ? `P${highestPallet}` : '—'

  const totalPallets = new Set(items.flatMap(i => i.pallets.map(p => p.num))).size

  const allUsedNums = items
  .flatMap(i => i.pallets.map(p => parseInt(p.num.replace(/\D/g, ''))))
  .filter(n => !isNaN(n))

const usedSet = new Set(allUsedNums)

const emptyPallets = []
for (let i = 1; i <= highestPallet; i++) {
  if (!usedSet.has(i)) {
    emptyPallets.push(`P${i}`)
  }
}

return (

<Box maxW="900px" mx="auto" px={{ base: 4, md: 8 }} py={6}>

{/* Page title */}
<Box mb={6}>
    <Text fontSize="2xl" fontWeight="800" color="gray.800" letterSpacing="-0.02em">
    Inventory
    </Text>
    <Text fontSize="sm" color="gray.500" mt={1}>
    External storage facility
    </Text>
</Box>

    {/* Stats */}
<SimpleGrid columns={3} spacing={3} mb={6}>
    {[
    { label: 'Total Items',   value: items.length },
    { label: 'Last pallet',     value: highestPalletLabel },
    { label: 'Pallets Used',  value: totalPallets },
    ].map(stat => (
<Box key={stat.label} bg="white" border="1px solid" borderColor="gray.200"
    borderRadius="lg" p={4}>
    <Stat>
    <StatLabel fontSize="xs" color="gray.500" textTransform="uppercase"
        letterSpacing="0.05em">
        {stat.label}
    </StatLabel>
    <StatNumber fontSize="xl" fontWeight="700" color="gray.800">
        {stat.value}
        </StatNumber>
    </Stat>
</Box>
    ))}
</SimpleGrid>

{isAdmin && emptyPallets.length > 0 && (
  <Box
    bg="white"
    border="1px solid"
    borderColor="gray.200"
    borderRadius="xl"
    p={4}
    mb={5}
  >
    <Flex align="center" justify="space-between" mb={3}>
      <Text fontSize="xs" fontWeight="600" color="gray.500"
        textTransform="uppercase" letterSpacing="0.08em">
        Empty Pallets
      </Text>
      <Badge colorScheme="orange" fontSize="0.7rem" px={2} py={1} borderRadius="md">
        {emptyPallets.length} empty
      </Badge>
    </Flex>
    <Flex flexWrap="wrap" gap={2}>
      {emptyPallets.map(p => (
        <Box
          key={p}
          px={3} py={1}
          bg="orange.50"
          border="1px solid"
          borderColor="orange.200"
          borderRadius="md"
          fontSize="sm"
          color="orange.600"
          fontWeight="500"
        >
          {p}
        </Box>
      ))}
    </Flex>
  </Box>
)}

      {/* Controls */}
<Flex gap={3} mb={4} flexWrap="wrap">
    <InputGroup maxW="320px">
    <InputLeftElement pointerEvents="none" color="gray.400">
        <LuSearch size={15} />
    </InputLeftElement>
        <Input
            placeholder="Search by item or pallet (e.g. P12)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            bg="white"
            focusBorderColor="blue.400"
            fontSize="sm"
        />
    </InputGroup>

    <Select
        maxW="180px"
        value={category}
        onChange={e => setCategory(e.target.value)}
        bg="white"
        focusBorderColor="blue.400"
        fontSize="sm"
    >
        {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
))}
    </Select>

    {isAdmin && (
  <>
    <input
      type="file"
      accept=".xlsx, .xls"
      ref={importRef}
      style={{ display: 'none' }}
      onChange={handleImport}
    />
    <Button
      leftIcon={<LuUpload size={14} />}
      colorScheme="blue"
      size="sm"
      ml="auto"
      isLoading={importing}
      loadingText="Importing..."
      onClick={() => importRef.current.click()}
    >
      Import Excel
    </Button>
  </>

        )}
</Flex>

      {/* List */}
<Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl"
        overflow="hidden">

        {/* List header */}
    <Flex
        px={4} py={2}
        bg="gray.50"
        borderBottom="1px solid"
        borderColor="gray.200"
        display={{ base: 'none', md: 'flex' }}
    >
    {[
            { label: 'Item Name', flex: 1 },
            { label: 'Category',  w: '110px' },
            { label: 'Qty',       w: '80px', textAlign: 'right' },
            { label: 'Pallets',   w: '70px', textAlign: 'center' },
            { label: '',          w: '32px' },
        ].map(col => (
        <Text key={col.label}
            fontSize="xs" fontWeight="600" color="gray.500"
            textTransform="uppercase" letterSpacing="0.06em"
            flex={col.flex} w={col.w} textAlign={col.textAlign}>
            {col.label}
            </Text>
        ))}
        </Flex>

        {loading ? (
  <Flex justify="center" py={12}>
    <Spinner color="blue.400" />
  </Flex>
) : filtered.length === 0 ? (
  <Box py={12} textAlign="center">
    <Text color="gray.400" fontSize="sm">No items match your search.</Text>
  </Box>
) : (
  filtered.map((item, index) => (
    <InventoryRow
      key={item.id}
      item={item}
      isOpen={openId === item.id}
      onToggle={() => setOpenId(openId === item.id ? null : item.id)}
      onPhotoUpdate={loadItems}
      onPhotoDelete={loadItems}
      isLast={index === filtered.length - 1}
    />
  ))
)}
    </Box>
    </Box>
)
}