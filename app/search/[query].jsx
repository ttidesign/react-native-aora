import { FlatList, View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchInput from '../../components/SearchInput';
import EmptyState from '../../components/EmptyState';
import useAppwrite from '../../lib/useAppwrite';
import VideoCard from '../../components/VideoCard';
import { searchPosts } from '../../lib/appwrite';
import { useLocalSearchParams } from 'expo-router';

const Search = () => {
	const { query } = useLocalSearchParams();
	const { data: posts, refetch } = useAppwrite(() => searchPosts(query));
	useEffect(() => {
		refetch();
	}, [query]);

	return (
		<SafeAreaView className='bg-primary h-full'>
			<FlatList
				data={posts}
				keyExtractor={(item) => item.$id}
				renderItem={({ item }) => (
					<VideoCard
						video={item.video}
						thumbnail={item.thumbnail}
						creator={item.creator.username}
						avatar={item.creator.avatar}
						title={item.title}
					/>
				)}
				ListHeaderComponent={() => (
					<View className='my-6 px-4'>
						<Text className='font-pmedium text-sm text-gray-100'>
							Search Results
						</Text>
						<Text className='text-2xl font-psemibold text-white'>{query}</Text>
						<View className='mt-6 mb-8'>
							<SearchInput initialQuery={query} refetch={refetch} />
						</View>
					</View>
				)}
				ListEmptyComponent={() => (
					<EmptyState
						className='text-white'
						title='No Videos Found'
						subtitle='No video founds for this search'
					/>
				)}
			/>
		</SafeAreaView>
	);
};

export default Search;
