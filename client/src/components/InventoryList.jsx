import { parseExcelToItems } from '../utils/excelParser'
import { useRef, useState } from 'react'
import {
Box, Flex, Text, Input, InputGroup, InputLeftElement,
Select, Button, SimpleGrid, Stat, StatLabel, StatNumber,
} from '@chakra-ui/react'
import { LuSearch, LuUpload } from 'react-icons/lu'
import { mockItems } from '../data/mockItems'
import { useAdmin } from '../hooks/useAdmin'
import InventoryRow from './InventoryRow'

export default function InventoryList() {
const { isAdmin } = useAdmin()
const [items, setItems] = useState(mockItems)
const [search, setSearch] = useState('')
const [category, setCategory] = useState('All')
const [openId, setOpenId] = useState(null)

const importRef = useRef()
const [importing, setImporting] = useState(false)

const handleImport = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  setImporting(true)
  try {
    const parsed = await parseExcelToItems(file)
    setItems(parsed)
    setOpenId(null)
  } catch (err) {
    console.error('Import failed:', err)
  } finally {
    setImporting(false)
    importRef.current.value = ''
  }
}

const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))]

const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || item.category === category
    return matchSearch && matchCat
})

const handlePhotoUpdate = (id, photoUrl) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, photo: photoUrl } : i))
}

const handlePhotoDelete = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, photo: null } : i))
}

const totalQty = items.reduce((sum, i) => sum + i.totalQty, 0)
const totalPallets = new Set(items.flatMap(i => i.pallets.map(p => p.num))).size

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
    { label: 'Total Qty',     value: totalQty.toLocaleString() },
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

      {/* Controls */}
<Flex gap={3} mb={4} flexWrap="wrap">
    <InputGroup maxW="320px">
    <InputLeftElement pointerEvents="none" color="gray.400">
        <LuSearch size={15} />
    </InputLeftElement>
        <Input
            placeholder="Search items..."
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

        {filtered.length === 0 ? (
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
            onPhotoUpdate={handlePhotoUpdate}
            onPhotoDelete={handlePhotoDelete}
            isLast={index === filtered.length - 1}
            />
        ))
    )}
    </Box>
    </Box>
)
}