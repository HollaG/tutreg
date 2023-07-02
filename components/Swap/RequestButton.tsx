import { ChevronDownIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, Button, MenuList, MenuItem } from "@chakra-ui/react";
import { keepAndCapFirstThree } from "../../lib/functions";
import { FullInfo } from "../../pages/swap/create";

type RequestButtonProps = {
    onClick: (option: FullInfo) => void;
    options: FullInfo[];
    size: string;
};

const RequestButton = ({ options, onClick, size }: RequestButtonProps) => {
    return (
        <Menu>
            <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                size={size}
                colorScheme="blue"
            >
                Request
            </MenuButton>
            <MenuList>
                {options.map((option, i) => (
                    <MenuItem key={i} onClick={() => onClick(option)}>
                        {" "}
                        {option.moduleCode}{" "}
                        {keepAndCapFirstThree(option.lessonType)}{" "}
                        {option.classNo}{" "}
                    </MenuItem>
                ))}
            </MenuList>
        </Menu>
    );
};

export default RequestButton;
