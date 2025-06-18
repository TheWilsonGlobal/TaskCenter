// Simple test script
const outputInfo = {
    result: "Hello12312312",
    actions: [],
    screenshots: [],
    dataExtracted: {},
    errors: [],
    performance: {},
    finalStatus: "pending",
};

const outputPath = "./profiles/profile_from_task_9/output.json";
await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
await fs.promises.writeFile(outputPath, JSON.stringify(outputInfo, null, 2));
