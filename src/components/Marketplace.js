import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../utils";
import { ethers } from "ethers";

export default function Marketplace() {
    const [data, setData] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);

    async function getAllNFTs() {
        try {
            // You should replace 'your_rpc_url' with the RPC URL of the Ethereum network you're using.
            // This could be a public RPC URL like Infura, Alchemy, or your own node.
            const provider = new ethers.providers.JsonRpcProvider('https://ethereum-goerli.publicnode.com');

            // Pull the deployed contract instance using a read-only provider
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider);

            // Create an NFT Token
            let transaction = await contract.getAllNFTs();

            // Fetch all the details of every NFT from the contract and display
            const items = await Promise.all(transaction.map(async i => {
                var tokenURI = await contract.tokenURI(i.tokenId);
                console.log("getting this tokenUri", tokenURI);
                tokenURI = GetIpfsUrlFromPinata(tokenURI);
                let meta = await axios.get(tokenURI).then(response => response.data);

                let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
                let item = {
                    price,
                    tokenId: i.tokenId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                }
                return item;
            }));

            setData(items);
        } catch (error) {
            console.error("Error fetching NFTs:", error);
        } finally {
            setDataFetched(true);
        }
    }

    // Fetch NFTs when the component mounts
    useEffect(() => {
        getAllNFTs();
    }, []);

    return (
        <div>
            <Navbar />
            <div className="flex flex-col place-items-center mt-20">
                <div className="md:text-xl font-bold text-white">
                    Top NFTs
                </div>
                <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                    {dataFetched ? (
                        data.map((value, index) => {
                            return <NFTTile data={value} key={index} />;
                        })
                    ) : (
                        <div>Loading...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
