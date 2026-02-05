async function main() {  // Line 1: Async main.
  const TraceFish = await ethers.getContractFactory("TraceFish");  // Line 2: Get factory.
  const traceFish = await TraceFish.deploy();  // Line 3: Deploy.
  await traceFish.waitForDeployment();  // Line 4: Wait.
  console.log("Contract deployed to:", await traceFish.getAddress());  // Line 5: Log address.
}
main().catch((error) => { console.error(error); process.exitCode = 1; });  // Lines 6-7: Run and catch.