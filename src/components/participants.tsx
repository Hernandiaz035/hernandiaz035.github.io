import { $accounts } from '@/lib/shared-bill/accounts'
import { $expenses } from '@/lib/shared-bill/expenses'
import { $participants } from '@/lib/shared-bill/participants'
import { getRandomId } from '@/lib/shared-bill/utils'
import { useStore } from '@nanostores/react'
import { type FC, type ChangeEvent, type MouseEvent, useEffect } from 'react'

export const Participants: FC = () => {
	const participants = useStore($participants)
	const accounts = useStore($accounts)
	const expenses = useStore($expenses)

	const addParticipant = () => {
		$participants.set([
			...participants,
			{ name: '', shares: 1, id: getRandomId(), accounts: [], contribution: null }
		])
	}

	const deleteParticipant = (event: MouseEvent<HTMLButtonElement>, index: number) => {
		event.preventDefault()
		const newParticipants = [...participants]
		newParticipants.splice(index, 1)
		$participants.set(newParticipants)
	}

	const modifyParticipantName = (event: ChangeEvent<HTMLInputElement>, index: number) => {
		const newParticipants = [...participants]
		const newName = event.currentTarget.value
		newParticipants[index].name = newName

		$participants.set(newParticipants)
	}

	const modifyParticipantShares = (event: ChangeEvent<HTMLInputElement>, index: number) => {
		const newParticipants = [...participants]
		const newValue = event.currentTarget.value
		const newValueParsed = Number.parseFloat(newValue)
		newParticipants[index].shares = newValueParsed

		if (newValue === '' || newValueParsed < 0 || Number.isNaN(newValueParsed)) {
			newParticipants[index].shares = 0
		}

		$participants.set(newParticipants)
	}

	const modifyParticipantAccounts = (
		participantIdx: number,
		accountId: string,
		checked: boolean
	) => {
		const newParticipants = [...participants]

		const accountOptIdx = accounts.findIndex((acc) => acc.id === accountId)

		const editingAccount = accounts.find((acc) => acc.id === accountId)

		if (checked && editingAccount) {
			newParticipants[participantIdx].accounts.push(editingAccount)
		} else {
			newParticipants[participantIdx].accounts = newParticipants[participantIdx].accounts.filter(
				(acc) => acc.id !== accounts[accountOptIdx].id
			)
		}

		$participants.set(newParticipants)
	}

	// debounced useEffect to calculate the total contributed by the participant
	useEffect(() => {
		const sumObj: Record<string, number> = {}
		const newParticipants = [...participants]

		expenses.forEach((it) => {
			if (sumObj[it.id]) {
				sumObj[it.id] += it.amount
				return
			}
			sumObj[it.id] = it.amount
		})

		newParticipants.forEach(({ id, contribution }) => {
			contribution = sumObj[id]
		})
	}, [expenses])

	const calculateTotal = () => participants.reduce((acc, item) => acc + item.shares, 0)

	return (
		<section className="mx-auto max-w-screen-lg p-8">
			<div className="mb-2 flex w-full flex-row items-center justify-between">
				<h2 className="text-xl font-semibold">Participants</h2>
				<button
					className="rounded-md border border-gray-400 bg-gray-600 px-2 py-1 text-gray-100"
					onClick={addParticipant}
				>
					Add participant
				</button>
			</div>
			<table className=" w-full border border-gray-500">
				<thead className="font-semibold">
					<tr className="border border-gray-500">
						<td>Name</td>
						<td>Amount of Shares</td>
						<td>Contributions</td>
						<td>Accounts</td>
						<td>Actions</td>
					</tr>
				</thead>
				<tbody>
					{participants.map((participant, index) => (
						<tr className=" border border-t-gray-500" key={index}>
							<td>
								<input
									type="text"
									name="participant-name"
									value={participant.name}
									onChange={(event) => modifyParticipantName(event, index)}
								/>
							</td>
							<td>
								<input
									type="number"
									name="participant-shares"
									value={participant.shares}
									onChange={(event) => modifyParticipantShares(event, index)}
								/>
							</td>
							<td>
								<p>{participant.contribution ?? '—'}</p>
							</td>
							<td>
								<div className="grid grid-cols-2 gap-1 p-1">
									{accounts.map((account) => (
										<div key={account.id} className="flex flex-row gap-1 ">
											<input
												type="checkbox"
												name={participant.id + account.id}
												checked={participant.accounts.some((acc) => acc.id === account.id)}
												onChange={(event) =>
													modifyParticipantAccounts(index, account.id, event.target.checked)
												}
											/>
											<label
												className="w-full truncate text-xs"
												htmlFor={participant.id + account.id}
											>
												{account.name}
											</label>
										</div>
									))}
								</div>
							</td>
							<td>
								<button
									className="my-1 rounded-md border border-gray-400 px-2 text-xs text-gray-700"
									onClick={(event) => deleteParticipant(event, index)}
								>
									Delete
								</button>
							</td>
						</tr>
					))}
					<tr className="border border-t-gray-500 font-semibold">
						<td>TOTAL:</td>
						<td>{calculateTotal()}</td>
					</tr>
				</tbody>
			</table>
		</section>
	)
}
