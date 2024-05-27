import {
	Account,
	Avatars,
	Client,
	Databases,
	ID,
	Query,
	Storage,
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
const storage = new Storage(client);

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
			configs.videoCollectionId,
			[Query.orderDesc('$createdAt')]
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

export async function getUserPosts(userId) {
	try {
		const posts = await databases.listDocuments(
			configs.databaseId,
			configs.videoCollectionId,
			[Query.equal('creator', userId), Query.orderDesc('$createdAt')]
		);
		if (!posts) throw new Error('Something went wrong');

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
}

export async function signOut() {
	try {
		const session = await account.deleteSession('current');
		return session;
	} catch (error) {
		throw new Error(error);
	}
}

export async function uploadFile(file, type) {
	if (!file) {
		return;
	}

	const asset = {
		name: file.fileName,
		type: file.mimeType,
		size: file.fileSize,
		uri: file.uri,
	};
	try {
		const uploadedFile = await storage.createFile(
			configs.storageId,
			ID.unique(),
			asset
		);
		const fileUrl = await getFilePreview(uploadedFile.$id, type);
		return fileUrl;
	} catch (error) {
		throw new Error(error);
	}
}

export async function getFilePreview(fileId, type) {
	let fileUrl;

	try {
		if (type === 'video') {
			fileUrl = storage.getFileView(configs.storageId, fileId);
		} else if (type === 'image') {
			fileUrl = storage.getFilePreview(
				configs.storageId,
				fileId,
				2000,
				2000,
				'top',
				100
			);
		} else {
			throw new Error('Invalid file type');
		}
		if (!fileUrl) throw Error;

		return fileUrl;
	} catch (error) {
		throw new Error(error);
	}
}

export async function createVideo(form) {
	try {
		const [thumbnailUrl, videoUrl] = await Promise.all([
			uploadFile(form.thumbnail, 'image'),
			uploadFile(form.video, 'video'),
		]);
		const newPost = await databases.createDocument(
			configs.databaseId,
			configs.videoCollectionId,
			ID.unique(),
			{
				title: form.title,
				thumbnail: thumbnailUrl,
				video: videoUrl,
				prompt: form.prompt,
				creator: form.userId,
			}
		);
		return newPost;
	} catch (error) {
		throw new Error(error);
	}
}
