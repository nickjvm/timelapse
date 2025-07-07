import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { useRef } from 'react'
import { BsSymmetryHorizontal, BsSymmetryVertical } from 'react-icons/bs'
import { GoGear } from 'react-icons/go'
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2'
import { MdDelete, MdOutlineRotateLeft } from 'react-icons/md'
import { RiGhost2Fill, RiGhost2Line } from 'react-icons/ri'

type Props = {
    setAlterationType: (alterationType: 'rotate' | 'zoom') => void,
    handleImageFlip: (direction: 'horizontal' | 'vertical') => void,
    ghostEnabled: boolean,
    toggleGhost: () => void
    handleDelete: () => void
}

export default function EditFrameMenu({ setAlterationType, handleImageFlip, ghostEnabled, toggleGhost, handleDelete }: Props) {
    const menuButtonRef = useRef<HTMLButtonElement>(null)
    return (
        <Menu>
            <MenuButton ref={menuButtonRef} className="z-60 border border-white bg-white/50 !rounded-full !p-3 hover:bg-white/75 transition-colors">
                <GoGear className="w-6 h-6" />
            </MenuButton>

            <MenuItems
                transition
                anchor="bottom"
                className="z-50 p-2 bg-white/85 w-13 rounded-full -mt-[50px] relative flex flex-col justify-center items-center"
            >
                <MenuItem>
                    <button className="-mt-[3px]">
                        <GoGear className="w-6 h-6" />
                    </button>
                </MenuItem>
                <MenuItem>
                    <button onClick={() => setAlterationType('rotate')} className="mt-3 hover:bg-white">
                        <MdOutlineRotateLeft className="w-6 h-6" />
                    </button>
                </MenuItem>
                <MenuItem>
                    <button onClick={() => setAlterationType('zoom')} className="hover:bg-white">
                        <HiOutlineMagnifyingGlass className="w-6 h-6" />
                    </button>
                </MenuItem>
                <MenuItem>
                    <button onClick={(e) => {
                        e.preventDefault()
                        handleImageFlip('horizontal')
                    }} className="hover:bg-white">
                        <BsSymmetryVertical className="w-6 h-6" />
                    </button>
                </MenuItem>
                <MenuItem>
                    <button onClick={(e) => {
                        e.preventDefault();
                        handleImageFlip('vertical')
                    }} className="hover:bg-white">
                        <BsSymmetryHorizontal className="w-6 h-6" />
                    </button>
                </MenuItem>
                <MenuItem>
                    <button onClick={toggleGhost} className="hover:bg-white">
                        {ghostEnabled ? <RiGhost2Fill className="w-6 h-6" /> : <RiGhost2Line className="w-6 h-6" />}
                    </button>
                </MenuItem>
                <MenuItem>
                    <button onClick={handleDelete} className="hover:bg-white hover:text-red-800">
                        <MdDelete className="w-6 h-6" />
                    </button>
                </MenuItem>
            </MenuItems>
        </Menu>
    )
}
