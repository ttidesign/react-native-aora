import {
	Account,
	Avatars,
	Client,
	Databases,
	ID,
	Query,
} from 'react-native-appwrite';
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
const avatars = new Avatars(client);
const databases = new Databases(client);

export async function createUser(email, password, username) {
	// Register User
	try {
		const newAccount = await account.create(
			ID.unique(),
			email,
			password,
			username
		);
		if (!newAccount) throw Error;
		const avatarUrl = avatars.getInitials(username);

		await signIn(email, password);

		const newUser = await databases.createDocument(
			configs.databaseId,
			configs.userCollectionId,
			ID.unique(),
			{
				accountId: newAccount.$id,
				email: email,
				username: username,
				avatar: avatarUrl,
			}
		);
		return newUser;
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
}

export async function signIn(email, password) {
	try {
		const session = await account.createEmailPasswordSession(email, password);
		return session;
	} catch (error) {
		throw new Error(error);
	}
}

export async function getCurrentUser() {
	try {
		const currentAccount = await account.get();
		if (!currentAccount) throw Error;

		const currentUser = await databases.listDocuments(
			configs.databaseId,
			configs.userCollectionId,
			[Query.equal('accountId', currentAccount.$id)]
		);

		if (!currentUser) throw Error;
		return currentUser.documents[0];
	} catch (error) {
		console.log(error);
	}
}

export async function getAllPosts() {
	try {
		const posts = await databases.listDocuments(
			configs.databaseId,
			configs.videoCollectionId
			//[Query.orderDesc('$createdAt', Query.limit(7))]
		);
		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
}

export async function getLatestPosts() {
	try {
		const posts = await databases.listDocuments(
			configs.databaseId,
			configs.videoCollectionId,
			[Query.orderDesc('$createdAt', Query.limit(7))]
		);
		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
}

export async function searchPosts(query) {
	try {
		const posts = await databases.listDocuments(
			configs.databaseId,
			configs.videoCollectionId,
			[Query.search('title', query)]
		);
		if (!posts) throw new Error('Something went wrong');

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
}
