<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	const { data } = $props<{ data: PageData }>();
	
	let searchTerm = $state('');
</script>

<svelte:head>
	<title>PyPI Stats - Download statistics for Python packages</title>
	<meta name="description" content="Get download statistics for Python packages from PyPI" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<div class="text-center">
		<h1 class="text-4xl font-bold text-gray-900 mb-8">
			PyPI Stats
		</h1>
		<p class="text-xl text-gray-600 mb-8">
			Download statistics for Python packages
		</p>
		
		<!-- Search Form -->
		<div class="max-w-md mx-auto">
			<form method="POST" action="/search" use:enhance class="flex gap-2">
				<input
					type="text"
					name="q"
					bind:value={searchTerm}
					placeholder="Enter package name..."
					class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					required
				/>
				<button
					type="submit"
					class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					Search
				</button>
			</form>
		</div>
		
		{#await data.packageCount then packageCount}
			<div class="mt-8 text-sm text-gray-500">
				Tracking {packageCount?.toLocaleString()} packages
			</div>
		{/await}
	</div>
	
	<!-- Quick Links -->
	<div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
		<div class="bg-white p-6 rounded-lg shadow-sm border">
			<h3 class="text-lg font-semibold text-gray-900 mb-2">Popular Packages</h3>
			<p class="text-gray-600 mb-4">Check download stats for popular Python packages</p>
			<a href="/search/numpy" class="text-blue-600 hover:text-blue-800 font-medium">View Examples →</a>
		</div>
		
		<div class="bg-white p-6 rounded-lg shadow-sm border">
			<h3 class="text-lg font-semibold text-gray-900 mb-2">API Access</h3>
			<p class="text-gray-600 mb-4">Programmatic access to download statistics</p>
			<a href="/api" class="text-blue-600 hover:text-blue-800 font-medium">API Documentation →</a>
		</div>
		
		<div class="bg-white p-6 rounded-lg shadow-sm border">
			<h3 class="text-lg font-semibold text-gray-900 mb-2">About</h3>
			<p class="text-gray-600 mb-4">Learn more about PyPI Stats and how it works</p>
			<a href="/about" class="text-blue-600 hover:text-blue-800 font-medium">Learn More →</a>
		</div>
	</div>
</div>
