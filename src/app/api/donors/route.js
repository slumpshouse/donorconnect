// Donors API - List and Create
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/requireAuth'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    const session = auth

    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limitRaw = parseInt(url.searchParams.get('limit') || '20', 10)
    const limit = Math.min(isNaN(limitRaw) ? 20 : limitRaw, 100)
    const search = url.searchParams.get('search') || null
    const status = url.searchParams.get('status') || null
    const retentionRisk = url.searchParams.get('retentionRisk') || null
    const sortByParam = url.searchParams.get('sortBy') || 'lastName'
    const sortOrder = url.searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc'

    const allowedSort = ['firstName', 'lastName', 'createdAt', 'totalAmount']
    const sortBy = allowedSort.includes(sortByParam) ? sortByParam : 'lastName'

    const where = { organizationId: session.user.organizationId }

    if (search) {
      const searchStr = String(search).trim()
      const phoneSearch = String(search).replace(/\D/g, '')
      const or = [
        { firstName: { contains: searchStr, mode: 'insensitive' } },
        { lastName: { contains: searchStr, mode: 'insensitive' } },
        { email: { contains: searchStr, mode: 'insensitive' } },
        { id: { contains: searchStr } },
      ]
      if (phoneSearch) or.push({ phone: { contains: phoneSearch } })
      where.OR = or
    }

    if (status) where.status = status
    if (retentionRisk) where.retentionRisk = retentionRisk

    const total = await prisma.donor.count({ where })

    const donors = await prisma.donor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        retentionRisk: true,
        totalGifts: true,
        totalAmount: true,
        lastGiftDate: true,
      },
    })

    return NextResponse.json({ donors, pagination: { page, limit, total } })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('GET /api/donors error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    const session = auth

    // only ADMIN or STAFF can create donors
    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { firstName, lastName, email, phone, address, city, state, zipCode } = body || {}

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'firstName and lastName are required' }, { status: 400 })
    }

    if (email && typeof email === 'string') {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
      }
    }

    // sanitize phone: keep digits only and enforce max length 10
    let phoneClean = null
    if (phone && typeof phone === 'string') {
      phoneClean = String(phone).replace(/\D/g, '')
      if (phoneClean.length > 10) {
        return NextResponse.json({ error: 'Phone must be at most 10 digits' }, { status: 400 })
      }
      if (phoneClean === '') phoneClean = null
    }

    const donorData = {
      organizationId: session.user.organizationId,
      firstName: String(firstName).slice(0, 50),
      lastName: String(lastName).slice(0, 50),
      email: email ? String(email).slice(0, 191) : null,
      phone: phoneClean,
      address: address ? String(address).slice(0, 191) : null,
      city: city ? String(city).slice(0, 100) : null,
      state: state ? String(state).slice(0, 100) : null,
      zipCode: zipCode ? String(zipCode).slice(0, 20) : null,
      status: 'ACTIVE',
      retentionRisk: 'UNKNOWN',
    }

    const donor = await prisma.donor.create({ data: donorData })

    return NextResponse.json({ donor }, { status: 201 })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('POST /api/donors error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}