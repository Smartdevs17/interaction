import { ethers } from "hardhat";

async function interaction() {
    const [signer] = await ethers.getSigners();

    const studentRecordContractAddress = "0x85dE0882112F798058a6819e0D51a863Ac80563A";

    const StudentRecordContract = await ethers.getContractAt("IStudentRecord", studentRecordContractAddress);

    const name = "Smart Developer";
    const age = 25;
    const course = "Zero Knowledge Proofs And Modern Cryptography";

    const tx = await StudentRecordContract.connect(signer).addStudent(name, age, course);

    tx.wait();

    console.log("🚀 Transaction Information: ", tx);


}

interaction();