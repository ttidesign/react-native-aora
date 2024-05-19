import { Account, Client, ID } from 'react-native-appwrite';
export const configs = {
	endpoint: 'https://cloud.appwrite.io/v1',
	platform: 'com.tk.aora',
	projectId: '66497131001e7050a935',
	databaseId: '6649723d003718b99987',
	userCollectionId: '66497260002daebebc10',
	videoCollectionId: '664972a400226f7727d2',
	storageId: '6649740500183be56502',
};
const client = new Client();

client
	.setEndpoint(configs.endpoint) // Your Appwrite Endpoint
	.setProject(configs.projectId) // Your project ID
	.setPlatform(configs.platform); // Your application ID or bundle ID.

const account = new Account(client);

export const createUser = () => {
    // Register User
    account.create(ID.unique(), 'me@example.com', 'password', 'Jane Doe').then(
        function (response) {
            console.log(response);
        },
        function (error) {
            console.log(error);
        }
    );
}
