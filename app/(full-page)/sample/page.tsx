import React from 'react'

function page() {
  return (
    <nav id="help" className="bg-blue-800 text-white p-4 w-full">
    <div className="flex justify-between items-center">
        <a href="#home" className="text-lg font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text">
            SimpleLogo
        </a>
        <div className="md:hidden relative">
            <input type="checkbox" id="menu-toggle" className="peer hidden absolute" />
            <label htmlFor="menu-toggle" className="cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </label>

            <div
                className="absolute top-full right-0 mt-2 bg-blue-900 rounded-md border border-blue-700 w-40 
      flex-col space-y-2 px-4 py-4 
      opacity-0 invisible transform translate-y-2 transition-all duration-300 
      peer-checked:opacity-100 peer-checked:visible peer-checked:translate-y-0 z-10"
            >
                <a href="#" className="block hover:underline">
                    Home
                </a>
                <a href="#" className="block hover:underline">
                    About
                </a>
                <a href="#" className="block hover:underline">
                    Services
                </a>
                <a href="#" className="block hover:underline">
                    Contact
                </a>
            </div>
        </div>

        <div className="hidden md:flex space-x-4">
            <a href="#" className="hover:underline">
                Home
            </a>
            <a href="#" className="hover:underline">
                About
            </a>
            <a href="#" className="hover:underline">
                Services
            </a>
            <a href="#" className="hover:underline">
                Contact
            </a>
        </div>
    </div>
</nav>
  )
}

export default page