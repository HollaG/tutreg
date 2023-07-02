import { ChevronDownIcon } from "@chakra-ui/icons";
import {
    Menu,
    MenuButton,
    Button,
    MenuList,
    MenuItem,
    MenuOptionGroup,
    MenuGroup,
} from "@chakra-ui/react";
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
                onClick={(e) => e.stopPropagation()}
            >
                Request
            </MenuButton>
            <MenuList>
                <MenuGroup title="What class do you have?">
                    {options.map((option, i) => (
                        <MenuItem
                            key={i}
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick(option);
                            }}
                        >
                            {" "}
                            {option.moduleCode}{" "}
                            {keepAndCapFirstThree(option.lessonType)}{" "}
                            {option.classNo}{" "}
                        </MenuItem>
                    ))}
                </MenuGroup>
            </MenuList>
        </Menu>
    );
};

export default RequestButton;
