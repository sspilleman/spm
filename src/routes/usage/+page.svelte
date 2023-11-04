<script lang="ts">
  import { parseRatecard, parseUsage, parseComputation } from "./parsers";
  import type { Computation, Rate, Usage } from "$lib/interfaces/index";
  // import type { Computation, Rate, Usage } from "../../lib/interfaces/index";
  import { Button, Checkbox, Indicator } from "flowbite-svelte";
  import RatecardTable from "../../lib/components/RatecardTable.svelte";
  // import UsageTable from '../../lib/components/UsageTable.svelte';
  import Line from "../../lib/components/Line.svelte";
  import Logo from "../../lib/components/Logo.svelte";
  import type { PointOptionsObject } from "highcharts";
  import type Highcharts from "highcharts";

  const accept = `text/csv`;
  // const accept = `text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
  let ratecard: Rate[] = [];
  let usage: Usage[] = [];
  let computation: Computation[] = [];

  const change = async (e: null | EventTarget) => {
    let files: FileList = (e as HTMLInputElement).files as FileList;
    // await upload(files);
    for (const file of files) {
      const name = file.name.toLocaleLowerCase();
      if (file.type === "text/csv" && name.includes("ratecard")) {
        ratecard = (await parseRatecard(file)) as Rate[];
      } else if (file.type === "text/csv" && name.includes("usage")) {
        usage = (await parseUsage(file)) as Usage[];
      } else if (file.type === "text/csv" && name.includes("computation")) {
        computation = (await parseComputation(file)) as Computation[];
        console.log("computation", computation);
      } else {
        alert(`incorect filename or type combo: ${file.name}, ${file.type}`);
      }
    }
  };

  // $: if (ratecard && usage) {
  // 	for (const usagerecord of usage) {
  // 		const idx = ratecard.findIndex(
  // 			(rate) => usagerecord['Product Part'] === rate['Product Part']
  // 		);
  // 		if (idx === -1) console.log('missing', usagerecord);
  // 	}
  // 	console.log('im here');
  // }

  // const upload = async (files: FileList) => {
  // 	const body = new FormData();
  // 	body.set('customer', 'KPN');
  // 	for (const file of files) {
  // 		console.log({ name: file.name, type: file.type });
  // 		body.append(file.name, file);
  // 	}
  // 	const url = 'http://localhost:2000/oracle/upload';
  // 	const response = await fetch(url, { method: 'POST', body });
  // 	if (response.ok) {
  // 		console.log('Success:', await response.json());
  // 	} else console.error('Error:', response.statusText);
  // };

  // import { format } from 'date-fns';

  let charts: Highcharts.Options[];
  let [parts, parts_selected]: [string[], string[]] = [[], []];

  const createCharts = () => {
    charts = parts.reduce((prev, part) => {
      if (usage) {
        const data: PointOptionsObject[] = usage
          .filter((u) => u["Product Name"] === part)
          .sort((a, b) => a["Starting Date"] - b["Starting Date"])
          .map((u) => [u["Starting Date"], u["Usage Quantity"]]);
        prev.push({
          title: {
            text: part,
            style: {
              color: "rgb(255 75 170 / var(--tw-text-opacity))",
            },
          },
          xAxis: { type: "datetime" },
          yAxis: { title: { text: "Quantity" } },
          legend: {
            enabled: false,
          },
          series: [
            {
              type: "line",
              name: part,
              data,
            },
          ],
        });
      }
      return prev;
    }, [] as Highcharts.Options[]);
    // console.log(charts);
  };

  const createParts = (usage: Usage[]) => {
    parts = [...new Set(usage.map((s) => s["Product Name"]))].filter(
      (s) => s.toLocaleLowerCase() // .includes('database')
    );
    parts_selected = [...parts];
  };

  const findChanged = (days: number) => {
    parts_selected = parts.reduce((prev, part) => {
      if (usage) {
        const day = 24 * 60 * 60 * 1000;
        const partdata = usage.filter((u) => u["Product Name"] === part);
        const timestamp = Math.max(...partdata.map((p) => p["Starting Date"]));
        const filtered = partdata
          .filter((u) => u["Starting Date"] > timestamp - days * day)
          .map((u) => u["Usage Quantity"]);
        const [min, max] = [Math.min(...filtered), Math.max(...filtered)];
        // if (min !== max)
        // 	console.log("findChanged", days, part, min, max);
        if (min !== max) prev.push(part);
      }
      return prev;
    }, [] as string[]);
  };

  $: if (usage.length > 0) createParts(usage);
  $: if (parts.length > 0) createCharts();
</script>

<svelte:head>
  <title>Ratecard & Usage</title>
  <meta name="description" content="Ratecard & Usage" />
</svelte:head>

<div class="w-full flex flex-row gap-4 items-center">
  <div class="w-10">
    <Logo />
  </div>
  <div>
    ratecard
    {#if ratecard.length > 0}
      <Indicator class="inline-block" color="green" />
    {:else}
      <Indicator class="inline-block" color="red" />
    {/if}
  </div>
  <div>
    computation
    {#if computation.length > 0}
      <Indicator class="inline-block" color="green" />
    {:else}
      <Indicator class="inline-block" color="red" />
    {/if}
  </div>
  <div>
    usage
    {#if usage.length > 0}
      <Indicator class="inline-block" color="green" />
    {:else}
      <Indicator class="inline-block" color="red" />
    {/if}
  </div>
  <div class="grow">
    <input {accept} class="w-full" type="file" multiple on:change={(e) => change(e.target)} />
  </div>
</div>

{#if ratecard.length > 0}
  <RatecardTable {ratecard} />
{/if}

<!-- {#if usage.length > 0}
	<UsageTable {usage}></UsageTable>
{/if} -->

{#if parts && parts.length > 0}
  <div class="mt-4 flex flex-row flex-wrap gap-2">
    <Button on:click={() => (parts_selected = [...parts])} size="sm"
      >select all</Button
    >
    <Button on:click={() => (parts_selected = [])} size="sm" color="dark"
      >select none</Button
    >
    <Button on:click={() => findChanged(1)} size="sm" color="green"
      >modified 1 day</Button
    >
    <Button on:click={() => findChanged(4)} size="sm" color="green"
      >modified 4 days</Button
    >
    <Button on:click={() => findChanged(7)} size="sm" color="green"
      >modified 7 days</Button
    >
    <Button on:click={() => findChanged(14)} size="sm" color="green"
      >modified 14 days</Button
    >
  </div>
  <ul class="mt-4 flex flex-row flex-wrap">
    {#each parts as part (part)}
      <li class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-600 w-72">
        <Checkbox bind:group={parts_selected} value={part}>{part}</Checkbox>
      </li>
    {/each}
  </ul>
{/if}

{#if charts?.length > 0}
  <div class="mt-4 flex flex-row flex-wrap gap-4">
    {#each charts as options}
      {@const show = parts_selected.includes(`${options.title?.text}`)}
      {#if show}
        <Line {options} />
      {/if}
    {/each}
  </div>
{/if}
