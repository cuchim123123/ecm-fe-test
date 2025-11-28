import React from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '@/utils/formatDate'
import { ADMIN_ROUTES } from '@/config/routes'
const Topbar = () => {

    return (
        <div className='border-b px-4 mb-4 mt-2 pb-4 border-stone-200'>
            <div className='flex items-center justify-between p-0.5'>
                <div>
                    <span className='block font-bold'>Wassup, admin!</span>
                    <span className='block text-sm text-stone-500'>{formatDate()}</span>
                </div>

                <div className="flex gap-2">
                    <Link
                        to={ADMIN_ROUTES.VOUCHERS}
                        className="flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded"
                    >
                        Vouchers
                    </Link>
                    <Link
                        to={ADMIN_ROUTES.BADGES}
                        className="flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded"
                    >
                        Badges
                    </Link>
                    <Link
                        to={ADMIN_ROUTES.LOYALTY}
                        className="flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded"
                    >
                        Loyalty
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Topbar
