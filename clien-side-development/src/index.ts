import * as Web3 from '@solana/web3.js';
import * as fs from 'fs';
import dotenv from 'dotenv';

/// the address of the ping program itself
const PROGRAM_ID = new Web3.PublicKey("ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa")
/// the address of an account that stores the data for the program
const PROGRAM_DATA_PUBLIC_KEY = new Web3.PublicKey("Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod")

async function initializeKeyPair(
    connection: Web3.Connection
): Promise<Web3.Keypair> {
    if (!process.env.PRIVATE_KEY) {
        console.log('Generating new keypair...');
        const signer = Web3.Keypair.generate();

        console.log('Creating .env file');
        fs.writeFileSync('.env', `PRIVATE_KEY=[${signer.secretKey.toString()}]`);
        // When generating a keypair
        await airdropSolIfNeeded(signer, connection);
 
        return signer;
    }   

    const secret = JSON.parse(process.env.PRIVATE_KEY ?? '') as number[];
    const secretKey = Uint8Array.from(secret);
    const keyPairFromSecret = Web3.Keypair.fromSecretKey(secretKey);
    // When creating it from the secret key
    await airdropSolIfNeeded(keyPairFromSecret, connection);

    return keyPairFromSecret;
}

async function airdropSolIfNeeded(
    signer: Web3.Keypair,
    connection: Web3.Connection
) {
    const balance = await connection.getBalance(signer.publicKey);
    const currentBalance = balance / Web3.LAMPORTS_PER_SOL
    console.log('Current balance is', currentBalance, 'SOL');

    if(currentBalance < 1) {
        // can get up to 2 SOL per request
        console.log('Airdropping 1 SOL');
        const airdropSignature = await connection.requestAirdrop(
            signer.publicKey,
            Web3.LAMPORTS_PER_SOL
        );

        const latestBlockHash = await connection.getLatestBlockhash();

        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: airdropSignature,
        });

        const newBalance = await connection.getBalance(signer.publicKey);
        console.log('New balance is', newBalance / Web3.LAMPORTS_PER_SOL, 'SOL');
    }
}

async function pingProgram(connection: Web3.Connection, payer: Web3.Keypair) {
    const transaction = new Web3.Transaction();
    const instruction = new Web3.TransactionInstruction({
    //1. The public keys of all the accounts the instruction will read/write
    keys: [
        {
            pubkey: PROGRAM_DATA_PUBLIC_KEY,
            isSigner: false,
            isWritable: true
        }
    ],
        
    // 2. The ID of the program this instruction will be sent to
    programId: PROGRAM_ID
        
    // 3. Data - in this case, there's none!
    })

    // add the instruction to the transaction
    transaction.add(instruction)
    // send the transaction to the network
    const transactionSignature = await Web3.sendAndConfirmTransaction(connection, transaction, [payer])
    
    console.log(`Transaction https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`)
}

async function transferSolFromOneAccountToAnother(
    connection: Web3.Connection, 
    amount: number,
    sender: Web3.Keypair, 
    receiver: Web3.Keypair
) {
    const transaction = new Web3.Transaction();

    const instruction = Web3.SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: receiver.publicKey,
        lamports: amount,
    });

    transaction.add(instruction)

    const transactionSignature = await Web3.sendAndConfirmTransaction(connection, transaction, [sender])
    
    console.log(`Transaction https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`)

}

async function main() {
    const connection = new Web3.Connection(Web3.clusterApiUrl('devnet'));
    const sender = await initializeKeyPair(connection);

    console.log("Sender public key:", sender.publicKey.toBase58());

    await pingProgram(connection, sender);

    const receiver = Web3.Keypair.generate();
    console.log("Receiver public key:", receiver.publicKey.toBase58());

    await transferSolFromOneAccountToAnother(connection, 0.1 * Web3.LAMPORTS_PER_SOL, sender, receiver);

    console.log('Sender balance ', await connection.getBalance(sender.publicKey), '\nReceiver balance ', await connection.getBalance(receiver.publicKey));
}

main()
    .then(() => {
        console.log("Finished successfully")
        process.exit(0)
    })
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
