import {
    Box,
    Button,
    HStack,
    Flex,
    IconButton,
    Input,
    Select,
    createListCollection,
    Portal,
    NativeSelect
} from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import { useState } from "react";

import { BorderColor, PrimaryColor } from "@os4a/theme";
import { SearchIcon } from "@components/Icons";
import { OS4A_URL } from "@os4a/links";

// Keys of OneStop4All's ResourceType enum (services/ResourceTypeUtils.ts, b39aaff)
const resourceTypes = [
    "Repository",
    "Publication",
    "Dataset",
    "Software",
    "Organisation",
    "MetadataStandard",
    "LHBArticle",
    "LearningResource",
    "DataService",
    "Service"
].sort((a, b) => a.localeCompare(b));

// Same look as the OneStop4All search bar, but the standalone host has no search:
// a search opens the results page of the live OneStop4All.
export function SearchBar() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const intl = useIntl();
    const [selectedResource, setSelectResource] = useState("");

    function startSearch(): void {
        const params = new URLSearchParams();
        if (searchTerm !== "") {
            params.set("searchterm", searchTerm);
        }
        if (selectedResource !== "") {
            params.set("resourcetype", selectedResource);
        }
        const query = params.toString();
        window.location.assign(`${OS4A_URL}/search${query ? `?${query}` : ""}`);
    }

    function handleKeyDown(key: string): void {
        if (key === "Enter") {
            startSearch();
        }
    }

    const options = createResourceTypeSelectOptions();

    return (
        <Box
            borderWidth={{ base: "10px", custombreak: "15px" }}
            borderColor="rgb(5, 102, 141, 0.7)"
        >
            <div id="searchbar">
                <HStack padding={{ base: "5px 10px", custombreak: "8px 15px" }} w="100%" bg="white">
                    <NativeSelect.Root flex={{ base: "0 0 17rem" }}>
                        <NativeSelect.Field
                            value={selectedResource}
                            onChange={(e) => setSelectResource(e.target.value)}
                            textTransform="uppercase"
                            color={PrimaryColor}
                            fontSize={16}
                            border="none"
                        >
                            <option value="">
                                {intl.formatMessage({
                                    id: "search.search-bar.dropdownPlaceholder"
                                })}
                            </option>

                            {resourceTypes.map((e) => (
                                <option key={e} value={e}>
                                    {intl.formatMessage({ id: `resource-types.${e}` })}
                                </option>
                            ))}
                        </NativeSelect.Field>

                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                    <Box flex="0 0 1px" bgColor={BorderColor} alignSelf="stretch" />
                    <Input
                        placeholder={intl.formatMessage({ id: "search.search-bar.placeholder" })}
                        fontSize={16}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        onKeyDown={(event) => handleKeyDown(event.key)}
                        borderColor="white"
                        _placeholder={{ color: "gray.500", fontSize: 16 }}
                    />
                    <Button
                        onClick={() => startSearch()}
                        paddingLeft={"40px"}
                        paddingRight={"40px"}
                    >
                        <SearchIcon boxSize={6} />
                        <Box fontWeight={700} fontSize={16}>
                            {intl.formatMessage({ id: "search.search-bar.button-label" })}
                        </Box>
                    </Button>
                </HStack>
            </div>
            <div id="searchbarResponsive">
                <Flex bg="white" direction={"column"}>
                    <Select.Root
                        collection={options}
                        width={"310px"}
                        onValueChange={({ value }) => value[0] && setSelectResource(value[0])}
                    >
                        <Select.Control>
                            <Select.Trigger
                                borderColor="white"
                                color={PrimaryColor}
                                textTransform="uppercase"
                                fontSize={16}
                            >
                                <Select.ValueText
                                    placeholder={intl.formatMessage({
                                        id: "search.search-bar.dropdownPlaceholder"
                                    })}
                                />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                                <Select.Indicator color={PrimaryColor} />
                            </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                            <Select.Positioner>
                                <Select.Content>
                                    {options.items.map((option) => (
                                        <Select.Item item={option} key={option.value}>
                                            {option.label}
                                            <Select.ItemIndicator />
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Positioner>
                        </Portal>
                    </Select.Root>
                    <Flex alignItems="center">
                        <Input
                            placeholder={intl.formatMessage({
                                id: "search.search-bar.placeholder-mobile"
                            })}
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            onKeyDown={(event) => handleKeyDown(event.key)}
                            //borderColor="white"
                            margin={"2% 2% 2% 2%"}
                            outline={"1px solid #05668d"}
                            _placeholder={{ color: "gray.500", fontSize: 16 }}
                        />
                        <Button
                            variant="solid"
                            hideBelow="custombreak"
                            onClick={() => startSearch()}
                        >
                            <SearchIcon boxSize={6} />
                            <Box>
                                {intl.formatMessage({ id: "search.search-bar.button-label" })}
                            </Box>
                        </Button>
                        <IconButton
                            aria-label="start search"
                            size="sm"
                            hideFrom="custombreak"
                            onClick={() => startSearch()}
                            marginRight={"1%"}
                        >
                            <SearchIcon />
                        </IconButton>
                    </Flex>
                </Flex>
            </div>
        </Box>
    );

    function createResourceTypeSelectOptions() {
        return createListCollection({
            items: [
                {
                    value: "",
                    label: intl.formatMessage({
                        id: "search.search-bar.dropdownPlaceholder"
                    })
                },
                ...resourceTypes.map((e) => ({
                    value: e,
                    label: intl.formatMessage({ id: `resource-types.${e}` })
                }))
            ]
        });
    }
}
