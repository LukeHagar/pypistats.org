<script lang="ts">
    import type { PageData } from './$types';
    const { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
    <title>{data.packageName} - PyPI Stats</title>
    <meta name="description" content="Download statistics for {data.packageName} package" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{data.packageName}</h1>
		<p class="text-gray-600">Download statistics from PyPI</p>
	</div>
	
	<!-- Recent Stats -->
    {#if data.recentStats}
		<div class="bg-white rounded-lg shadow-sm border mb-8">
			<div class="px-6 py-4 border-b">
				<h2 class="text-lg font-semibold text-gray-900">Recent Downloads</h2>
			</div>
			<div class="p-6">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {#each Object.entries(data.recentStats) as [period, count]}
						<div class="text-center">
							<div class="text-2xl font-bold text-blue-600">
								{(count as number).toLocaleString()}
							</div>
							<div class="text-sm text-gray-500 capitalize">
								{period.replace('last_', '')}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Overall Stats -->
    {#if data.overallStats && data.overallStats.length > 0}
		<div class="bg-white rounded-lg shadow-sm border mb-8">
			<div class="px-6 py-4 border-b">
				<h2 class="text-lg font-semibold text-gray-900">Overall Downloads</h2>
			</div>
			<div class="p-6">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead>
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
                            {#each data.overallStats.slice(0, 10) as stat}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.date}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.category}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.downloads.toLocaleString()}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Python Version Stats -->
    {#if data.pythonMajorStats && data.pythonMajorStats.length > 0}
		<div class="bg-white rounded-lg shadow-sm border mb-8">
			<div class="px-6 py-4 border-b">
				<h2 class="text-lg font-semibold text-gray-900">Python Major Version Downloads</h2>
			</div>
			<div class="p-6">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead>
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
                            {#each data.pythonMajorStats.slice(0, 10) as stat}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.date}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.category}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.downloads.toLocaleString()}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- System Stats -->
    {#if data.systemStats && data.systemStats.length > 0}
		<div class="bg-white rounded-lg shadow-sm border mb-8">
			<div class="px-6 py-4 border-b">
				<h2 class="text-lg font-semibold text-gray-900">System Downloads</h2>
			</div>
			<div class="p-6">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead>
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
                            {#each data.systemStats.slice(0, 10) as stat}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.date}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.category}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.downloads.toLocaleString()}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- API Links -->
	<div class="bg-blue-50 rounded-lg p-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-4">API Access</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
			<div>
				<strong>Recent downloads:</strong>
                <a href="/api/packages/{data.packageName}/recent" class="text-blue-600 hover:text-blue-800 ml-2">JSON</a>
			</div>
			<div>
				<strong>Overall downloads:</strong>
                <a href="/api/packages/{data.packageName}/overall" class="text-blue-600 hover:text-blue-800 ml-2">JSON</a>
			</div>
			<div>
				<strong>Python major versions:</strong>
                <a href="/api/packages/{data.packageName}/python_major" class="text-blue-600 hover:text-blue-800 ml-2">JSON</a>
			</div>
			<div>
				<strong>System downloads:</strong>
                <a href="/api/packages/{data.packageName}/system" class="text-blue-600 hover:text-blue-800 ml-2">JSON</a>
			</div>
		</div>
	</div>
</div> 