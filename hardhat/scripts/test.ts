import pressAnyKey from "press-any-key";

async function main(){
    console.log("pressAnyKey", pressAnyKey);
    await pressAnyKey();
    console.log("done!")
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
